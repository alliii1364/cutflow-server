import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// ── R2 client ─────────────────────────────────────────────────────────────────

function buildR2Client(): { client: S3Client; bucket: string; publicUrlBase: string } {
  const accountId = process.env.R2_ACCOUNT_ID;
  if (!accountId) throw new Error('R2_ACCOUNT_ID is required in .env');

  const bucket = process.env.R2_BUCKET_NAME || 'cutflow-media';
  const publicUrlBase = process.env.R2_PUBLIC_URL || '';

  return {
    client: new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      },
    }),
    bucket,
    publicUrlBase,
  };
}

// ── Filename parser ───────────────────────────────────────────────────────────
// Format: "#27 _ Description. tag1, tag2, tag3.mov"
//   → sortOrder=27, name="Description", tags=["tag1","tag2","tag3"]

function parseFilename(filename: string): { sortOrder: number; name: string; tags: string[] } {
  const stem = path.basename(filename, path.extname(filename));

  // Extract optional "#N _ " prefix
  let sortOrder = 0;
  let rest = stem;
  const prefixMatch = stem.match(/^#(\d+)\s+_\s+([\s\S]+)$/);
  if (prefixMatch) {
    sortOrder = parseInt(prefixMatch[1], 10);
    rest = prefixMatch[2];
  }

  // Split "Name. tag1, tag2" on the first ". "
  const dotIdx = rest.indexOf('. ');
  if (dotIdx === -1) {
    return { sortOrder, name: rest.trim(), tags: [] };
  }

  const name = rest.slice(0, dotIdx).trim();
  const tags = rest
    .slice(dotIdx + 2)
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  return { sortOrder, name, tags };
}

// ── MIME / type helpers ───────────────────────────────────────────────────────

const MIME_MAP: Record<string, string> = {
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.webm': 'video/webm',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
};

const VIDEO_EXTS = new Set(['.mp4', '.mov', '.webm']);

// ── Directory walker ──────────────────────────────────────────────────────────

interface VideoFile {
  absolutePath: string;
  relativePath: string; // relative to ASSETS_DIR, using forward slashes
  category: string;     // depth-1 folder name
  subcategory: string;  // immediate parent folder name
}

async function walkVideos(rootDir: string): Promise<VideoFile[]> {
  const results: VideoFile[] = [];

  async function walk(dir: string): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile() && MIME_MAP[path.extname(entry.name).toLowerCase()]) {
        const rel = path.relative(rootDir, fullPath).replace(/\\/g, '/');
        const parts = rel.split('/');
        if (parts.length < 2) continue; // skip files directly in root

        const category = parts[0];
        // immediate parent: last folder before the file
        const subcategory = parts.length >= 3 ? parts[parts.length - 2] : parts[0];

        results.push({ absolutePath: fullPath, relativePath: rel, category, subcategory });
      }
    }
  }

  await walk(rootDir);
  return results;
}

// ── Upsert helpers ────────────────────────────────────────────────────────────

async function upsertCategory(name: string, sortOrder: number) {
  const existing = await prisma.brollCategory.findFirst({ where: { name } });
  if (existing) return existing;
  return prisma.brollCategory.create({ data: { name, sortOrder } });
}

async function upsertSubcategory(categoryId: string, name: string, sortOrder: number) {
  const existing = await prisma.brollSubcategory.findFirst({ where: { categoryId, name } });
  if (existing) return existing;
  return prisma.brollSubcategory.create({ data: { categoryId, name, sortOrder } });
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const ASSETS_DIR = path.join(__dirname, '..', 'assets', 'videos');

  if (!fsSync.existsSync(ASSETS_DIR)) {
    console.error(`❌ Not found: ${ASSETS_DIR}`);
    console.error('   Create assets/videos/<Category>/<Subcategory>/<files> and re-run.');
    process.exit(1);
  }

  const { client: s3, bucket, publicUrlBase } = buildR2Client();

  console.log('🎬 Walking assets/videos/...\n');
  const files = await walkVideos(ASSETS_DIR);
  console.log(`Found ${files.length} media file(s)\n`);

  // Stable sort order per category based on first-seen order
  const catOrder = new Map<string, number>();
  for (const f of files) {
    if (!catOrder.has(f.category)) catOrder.set(f.category, catOrder.size);
  }

  let created = 0;
  let skipped = 0;

  for (const file of files) {
    const s3Key = `brolls/${file.relativePath}`;

    const existing = await prisma.brollItem.findUnique({ where: { s3Key } });
    if (existing) {
      console.log(`  ✓ skip  ${file.relativePath}`);
      skipped++;
      continue;
    }

    const { sortOrder, name, tags } = parseFilename(file.absolutePath);
    const ext = path.extname(file.absolutePath).toLowerCase();
    const contentType = MIME_MAP[ext] || 'application/octet-stream';
    const type = VIDEO_EXTS.has(ext) ? 'video' : 'image';

    const category = await upsertCategory(file.category, catOrder.get(file.category) ?? 0);
    const subcategory = await upsertSubcategory(category.id, file.subcategory, 0);

    console.log(`  ⬆️  ${file.relativePath}`);
    const body = await fs.readFile(file.absolutePath);
    await s3.send(
      new PutObjectCommand({ Bucket: bucket, Key: s3Key, Body: body, ContentType: contentType }),
    );

    await prisma.brollItem.create({
      data: {
        subcategoryId: subcategory.id,
        name,
        s3Key,
        s3Url: `${publicUrlBase}/${s3Key}`,
        type,
        tags,
        sortOrder,
        isPremium: false,
      },
    });

    console.log(`  ✅ "${name}" [${tags.join(', ')}]`);
    created++;
  }

  console.log(`\n✅ Done — ${created} created, ${skipped} skipped.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
