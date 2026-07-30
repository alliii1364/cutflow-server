import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as ffmpeg from 'fluent-ffmpeg';
import * as ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import * as ffprobeInstaller from '@ffprobe-installer/ffprobe';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

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
//
// Filter tokens within the tag list are extracted into structured fields and
// stripped from `tags`. Recognized tokens (case-insensitive):
//   gender:       "male" | "female"
//   ethnicity:    one of white | black | asian | spanish | swedish | italian |
//                          brazilian | ukrainian | european | british
//   age:          "age:30" or "age=30"   (integer 0..120)
// e.g. "#3 _ Smiling. portrait, male, white, age:28.mp4"

const GENDER_TOKENS = new Set(['male', 'female']);
const ETHNICITY_TOKENS = new Set([
  'white', 'black', 'asian', 'spanish', 'swedish', 'italian',
  'brazilian', 'ukrainian', 'european', 'british',
]);

interface ParsedFilename {
  sortOrder: number;
  name: string;
  tags: string[];
  gender?: 'male' | 'female';
  ethnicity?: string;
  age?: number;
}

function parseFilename(filename: string): ParsedFilename {
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
  const rawTags = rest
    .slice(dotIdx + 2)
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  const tags: string[] = [];
  let gender: 'male' | 'female' | undefined;
  let ethnicity: string | undefined;
  let age: number | undefined;

  for (const raw of rawTags) {
    const lower = raw.toLowerCase();

    const ageMatch = lower.match(/^age\s*[:=]\s*(\d{1,3})$/);
    if (ageMatch) {
      const n = parseInt(ageMatch[1], 10);
      if (n >= 0 && n <= 120) age = n;
      continue;
    }
    if (GENDER_TOKENS.has(lower)) { gender = lower as 'male' | 'female'; continue; }
    if (ETHNICITY_TOKENS.has(lower)) { ethnicity = lower; continue; }

    tags.push(raw);
  }

  return { sortOrder, name, tags, gender, ethnicity, age };
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

// ── Thumbnail ─────────────────────────────────────────────────────────────────
// Prefer a sidecar image (same stem, image extension) placed next to the video.
// Falls back to extracting a frame at 1 second using ffmpeg.

function findSidecarThumbnail(videoPath: string): string | null {
  const dir = path.dirname(videoPath);
  const stem = path.basename(videoPath, path.extname(videoPath));
  for (const ext of ['.jpg', '.jpeg', '.png', '.webp']) {
    const candidate = path.join(dir, stem + ext);
    if (fsSync.existsSync(candidate)) return candidate;
  }
  return null;
}

function getVideoDuration(videoPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) reject(err);
      else resolve(metadata.format.duration || 3);
    });
  });
}

async function extractFrame(videoPath: string, outputPath: string): Promise<void> {
  const duration = await getVideoDuration(videoPath);
  const timestamp = Math.max(1, duration * 0.3);

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .seekInput(timestamp)
      .frames(1)
      // Scale so the frame fills 640x360 (cover), then crop to exact 16:9.
      // Mirrors CSS object-cover: no distortion, no letterboxing.
      .videoFilter('scale=640:360:force_original_aspect_ratio=increase,crop=640:360')
      .output(outputPath)
      .on('end', () => resolve())
      .on('error', reject)
      .run();
  });
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
  const REFRESH_METADATA = process.env.REFRESH_METADATA === '1';

  if (!fsSync.existsSync(ASSETS_DIR)) {
    console.error(`❌ Not found: ${ASSETS_DIR}`);
    console.error('   Create assets/videos/<Category>/<Subcategory>/<files> and re-run.');
    process.exit(1);
  }

  console.log('🎬 Walking assets/videos/...\n');
  const files = await walkVideos(ASSETS_DIR);
  console.log(`Found ${files.length} video file(s)\n`);

  const catOrder = new Map<string, number>();
  for (const f of files) {
    if (!catOrder.has(f.category)) catOrder.set(f.category, catOrder.size);
  }

  if (REFRESH_METADATA) {
    console.log('🔁 REFRESH_METADATA=1 — updating existing items in place (no upload).\n');
    let updated = 0;
    let notFound = 0;

    for (const file of files) {
      const parsed = parseFilename(file.absolutePath);
      const category = await prisma.brollCategory.findFirst({ where: { name: file.category } });
      if (!category) { console.log(`  ?  no category for ${file.relativePath}`); notFound++; continue; }
      const subcategory = await prisma.brollSubcategory.findFirst({
        where: { categoryId: category.id, name: file.subcategory },
      });
      if (!subcategory) { console.log(`  ?  no subcategory for ${file.relativePath}`); notFound++; continue; }

      // Match by s3Key first (filename unchanged), fall back to (subcategoryId, name)
      // so renamed files still hit their existing row.
      const s3Key = `brolls/${file.relativePath}`;
      const existing =
        (await prisma.brollItem.findUnique({ where: { s3Key } })) ??
        (await prisma.brollItem.findFirst({
          where: { subcategoryId: subcategory.id, name: parsed.name },
        }));

      if (!existing) {
        console.log(`  ?  no match for "${parsed.name}" in ${file.subcategory}`);
        notFound++;
        continue;
      }

      await prisma.brollItem.update({
        where: { id: existing.id },
        data: {
          tags: parsed.tags,
          sortOrder: parsed.sortOrder,
          gender: parsed.gender ?? null,
          ethnicity: parsed.ethnicity ?? null,
          age: parsed.age ?? null,
        },
      });
      console.log(`  ✏️  ${parsed.name} [g=${parsed.gender ?? '-'} e=${parsed.ethnicity ?? '-'} a=${parsed.age ?? '-'}]`);
      updated++;
    }

    console.log(`\n✅ Refresh done — ${updated} updated, ${notFound} not matched.`);
    return;
  }

  const { client: s3, bucket, publicUrlBase } = buildR2Client();

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

    const { sortOrder, name, tags, gender, ethnicity, age } = parseFilename(file.absolutePath);
    const ext = path.extname(file.absolutePath).toLowerCase();
    const contentType = MIME_MAP[ext] || 'application/octet-stream';

    const category = await upsertCategory(file.category, catOrder.get(file.category) ?? 0);
    const subcategory = await upsertSubcategory(category.id, file.subcategory, 0);

    // Upload video
    console.log(`  ⬆️  ${file.relativePath}`);
    await uploadToR2(s3, bucket, file.absolutePath, s3Key, contentType);

    // s3Url is URL-encoded so # → %23, spaces → %20 — safe for browsers
    const s3Url = toPublicUrl(publicUrlBase, s3Key);

    // Thumbnail: sidecar image preferred, ffmpeg frame extraction as fallback
    let thumbnailUrl: string | null = null;
    const thumbKey = s3Key.replace(/\.[^.]+$/, '-thumb.jpg');
    const sidecar = findSidecarThumbnail(file.absolutePath);
    if (sidecar) {
      const sidecarMime = MIME_MAP[path.extname(sidecar).toLowerCase()] || 'image/jpeg';
      await uploadToR2(s3, bucket, sidecar, thumbKey, sidecarMime);
      thumbnailUrl = toPublicUrl(publicUrlBase, thumbKey);
      console.log(`  🖼️  thumbnail: sidecar`);
    } else {
      const tmpThumb = path.join(os.tmpdir(), `cutflow-thumb-${Date.now()}.jpg`);
      try {
        await extractFrame(file.absolutePath, tmpThumb);
        await uploadToR2(s3, bucket, tmpThumb, thumbKey, 'image/jpeg');
        thumbnailUrl = toPublicUrl(publicUrlBase, thumbKey);
        console.log(`  🖼️  thumbnail: ffmpeg frame`);
      } catch (err) {
        console.warn(`  ⚠️  thumbnail failed: ${(err as Error).message}`);
      } finally {
        await fs.unlink(tmpThumb).catch(() => {});
      }
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
        gender: gender ?? null,
        ethnicity: ethnicity ?? null,
        age: age ?? null,
      },
    });

    console.log(`  ✅ "${name}" [${tags.join(', ')}] g=${gender ?? '-'} e=${ethnicity ?? '-'} a=${age ?? '-'}`);
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
