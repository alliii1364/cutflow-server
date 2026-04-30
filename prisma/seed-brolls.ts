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
  const publicUrlBase = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '');

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

// ── URL builder ───────────────────────────────────────────────────────────────
// Each path segment is individually encoded so spaces → %20, # → %23, etc.
// This makes browser-safe URLs while keeping the R2 key unchanged.

function toPublicUrl(base: string, s3Key: string): string {
  const encoded = s3Key.split('/').map(encodeURIComponent).join('/');
  return `${base}/${encoded}`;
}

// ── Filename parser ───────────────────────────────────────────────────────────
// Format: "#27 _ My Clip Name. tag1, tag2, tag3.mov"
//      →  sortOrder=27, name="My Clip Name", tags=["tag1","tag2","tag3"]

function parseFilename(filename: string): { sortOrder: number; name: string; tags: string[] } {
  const stem = path.basename(filename, path.extname(filename));

  let sortOrder = 0;
  let rest = stem;
  const prefixMatch = stem.match(/^#(\d+)\s+_\s+([\s\S]+)$/);
  if (prefixMatch) {
    sortOrder = parseInt(prefixMatch[1], 10);
    rest = prefixMatch[2];
  }

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
const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

// ── Sidecar thumbnail ─────────────────────────────────────────────────────────
// Place a .jpg / .png with the same stem next to the video for a thumbnail.

function findSidecarThumbnail(videoPath: string): string | null {
  const dir = path.dirname(videoPath);
  const stem = path.basename(videoPath, path.extname(videoPath));
  for (const ext of ['.jpg', '.jpeg', '.png', '.webp']) {
    const candidate = path.join(dir, stem + ext);
    if (fsSync.existsSync(candidate)) return candidate;
  }
  return null;
}

// ── Directory walker ──────────────────────────────────────────────────────────

interface VideoFile {
  absolutePath: string;
  relativePath: string; // forward-slash, relative to ASSETS_DIR (original names preserved)
  category: string;     // depth-1 folder, original casing
  subcategory: string;  // immediate parent folder, original casing
}

async function walkVideos(rootDir: string): Promise<VideoFile[]> {
  const results: VideoFile[] = [];

  async function walk(dir: string): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        // Skip sidecar thumbnails — they are picked up per-video
        if (IMAGE_EXTS.has(ext)) continue;
        if (!VIDEO_EXTS.has(ext)) continue;

        const rel = path.relative(rootDir, fullPath).replace(/\\/g, '/');
        const parts = rel.split('/');
        if (parts.length < 2) continue;

        results.push({
          absolutePath: fullPath,
          relativePath: rel,                                          // e.g. "Miscellaneous/Cutting food/#27 _ Name.mov"
          category: parts[0],                                         // "Miscellaneous"
          subcategory: parts.length >= 3 ? parts[parts.length - 2] : parts[0], // "Cutting food"
        });
      }
    }
  }

  await walk(rootDir);
  return results;
}

// ── R2 upload ─────────────────────────────────────────────────────────────────

async function uploadToR2(
  s3: S3Client,
  bucket: string,
  localPath: string,
  key: string,
  contentType: string,
): Promise<void> {
  const body = await fs.readFile(localPath);
  await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType }));
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
  console.log(`Found ${files.length} video file(s)\n`);

  const catOrder = new Map<string, number>();
  for (const f of files) {
    if (!catOrder.has(f.category)) catOrder.set(f.category, catOrder.size);
  }

  let created = 0;
  let skipped = 0;

  for (const file of files) {
    // s3Key preserves original folder and filename — matches what R2 actually stores
    const s3Key = `brolls/${file.relativePath}`;

    // Skip if already in DB by exact s3Key
    const existing = await prisma.brollItem.findUnique({ where: { s3Key } });
    if (existing) {
      console.log(`  ✓ skip  ${file.relativePath}`);
      skipped++;
      continue;
    }

    const { sortOrder, name, tags } = parseFilename(file.absolutePath);
    const ext = path.extname(file.absolutePath).toLowerCase();
    const contentType = MIME_MAP[ext] || 'application/octet-stream';

    const category = await upsertCategory(file.category, catOrder.get(file.category) ?? 0);
    const subcategory = await upsertSubcategory(category.id, file.subcategory, 0);

    // Upload video
    console.log(`  ⬆️  ${file.relativePath}`);
    await uploadToR2(s3, bucket, file.absolutePath, s3Key, contentType);

    // s3Url is URL-encoded so # → %23, spaces → %20 — safe for browsers
    const s3Url = toPublicUrl(publicUrlBase, s3Key);

    // Sidecar thumbnail
    let thumbnailUrl: string | null = null;
    const sidecar = findSidecarThumbnail(file.absolutePath);
    if (sidecar) {
      const sidecarExt = path.extname(sidecar).toLowerCase();
      const thumbKey = s3Key.replace(/\.[^.]+$/, `-thumb${sidecarExt}`);
      const thumbMime = MIME_MAP[sidecarExt] || 'image/jpeg';
      await uploadToR2(s3, bucket, sidecar, thumbKey, thumbMime);
      thumbnailUrl = toPublicUrl(publicUrlBase, thumbKey);
      console.log(`  🖼️  thumbnail: ${path.basename(sidecar)}`);
    } else {
      console.log(`  ℹ️  no sidecar thumbnail`);
    }

    await prisma.brollItem.create({
      data: {
        subcategoryId: subcategory.id,
        name,
        s3Key,
        s3Url,
        thumbnailUrl,
        type: 'video',
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
