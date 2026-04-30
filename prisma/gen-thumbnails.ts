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
const ASSETS_DIR = path.join(__dirname, '..', 'assets', 'videos');

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

function toPublicUrl(base: string, s3Key: string): string {
  return `${base}/${s3Key.split('/').map(encodeURIComponent).join('/')}`;
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
  // 30% in: past any intro, in the main action, before the outro.
  // Input-side seek (-ss before -i) snaps to the nearest keyframe,
  // giving a complete, sharp frame — no motion blur.
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

async function main() {
  const force = process.argv.includes('--force') || process.argv.includes('-f');

  const items = await prisma.brollItem.findMany({
    where: force ? {} : { thumbnailUrl: null },
    select: { id: true, s3Key: true, name: true },
  });

  if (items.length === 0) {
    console.log('✅ All items already have thumbnails. Use --force to regenerate.');
    return;
  }

  console.log(`🖼️  ${force ? 'Regenerating' : 'Generating'} thumbnails for ${items.length} item(s)...\n`);

  const { client: s3, bucket, publicUrlBase } = buildR2Client();
  let done = 0;
  let failed = 0;

  for (const item of items) {
    // s3Key is like "brolls/Category/Subcategory/filename.mov"
    // Local file is at assets/videos/Category/Subcategory/filename.mov
    const localRelative = item.s3Key.replace(/^brolls\//, '');
    const localPath = path.join(ASSETS_DIR, localRelative.replace(/\//g, path.sep));

    if (!fsSync.existsSync(localPath)) {
      console.warn(`  ⚠️  Local file not found, skipping: ${localRelative}`);
      failed++;
      continue;
    }

    const thumbKey = item.s3Key.replace(/\.[^.]+$/, '-thumb.jpg');
    const tmpThumb = path.join(os.tmpdir(), `cutflow-thumb-${Date.now()}.jpg`);

    console.log(`  ⬆️  "${item.name}"`);
    try {
      await extractFrame(localPath, tmpThumb);

      const body = await fs.readFile(tmpThumb);
      await s3.send(new PutObjectCommand({
        Bucket: bucket,
        Key: thumbKey,
        Body: body,
        ContentType: 'image/jpeg',
      }));

      const thumbnailUrl = toPublicUrl(publicUrlBase, thumbKey);
      await prisma.brollItem.update({
        where: { id: item.id },
        data: { thumbnailUrl },
      });

      console.log(`  ✅ done`);
      done++;
    } catch (err) {
      console.warn(`  ❌ failed: ${(err as Error).message}`);
      failed++;
    } finally {
      await fs.unlink(tmpThumb).catch(() => {});
    }
  }

  console.log(`\n✅ Done — ${done} generated, ${failed} failed.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
