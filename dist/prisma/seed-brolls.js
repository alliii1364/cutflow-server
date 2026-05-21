"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require("dotenv");
dotenv.config();
const client_1 = require("@prisma/client");
const client_s3_1 = require("@aws-sdk/client-s3");
const fs = require("fs/promises");
const fsSync = require("fs");
const os = require("os");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
const ffprobeInstaller = require("@ffprobe-installer/ffprobe");
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);
const prisma = new client_1.PrismaClient();
function buildR2Client() {
    const accountId = process.env.R2_ACCOUNT_ID;
    if (!accountId)
        throw new Error('R2_ACCOUNT_ID is required in .env');
    const bucket = process.env.R2_BUCKET_NAME || 'cutflow-media';
    const publicUrlBase = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '');
    return {
        client: new client_s3_1.S3Client({
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
function toPublicUrl(base, s3Key) {
    const encoded = s3Key.split('/').map(encodeURIComponent).join('/');
    return `${base}/${encoded}`;
}
const GENDER_TOKENS = new Set(['male', 'female']);
const ETHNICITY_TOKENS = new Set([
    'white', 'black', 'asian', 'spanish', 'swedish', 'italian',
    'brazilian', 'ukrainian', 'european', 'british',
]);
const NATIONALITY_CODES = new Set([
    'american', 'british', 'canadian', 'australian', 'indian', 'pakistani',
    'chinese', 'japanese', 'korean', 'french', 'german', 'spanish', 'italian',
    'brazilian', 'mexican', 'nigerian', 'egyptian', 'emirati', 'turkish', 'saudi',
]);
function parseFilename(filename) {
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
    const tags = [];
    let gender;
    let ethnicity;
    let age;
    let nationality;
    for (const raw of rawTags) {
        const lower = raw.toLowerCase();
        const ageMatch = lower.match(/^age\s*[:=]\s*(\d{1,3})$/);
        if (ageMatch) {
            const n = parseInt(ageMatch[1], 10);
            if (n >= 0 && n <= 120)
                age = n;
            continue;
        }
        if (GENDER_TOKENS.has(lower)) {
            gender = lower;
            continue;
        }
        if (ETHNICITY_TOKENS.has(lower)) {
            ethnicity = lower;
            continue;
        }
        if (NATIONALITY_CODES.has(lower)) {
            nationality = lower;
            continue;
        }
        tags.push(raw);
    }
    return { sortOrder, name, tags, gender, ethnicity, age, nationality };
}
const MIME_MAP = {
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
function findSidecarThumbnail(videoPath) {
    const dir = path.dirname(videoPath);
    const stem = path.basename(videoPath, path.extname(videoPath));
    for (const ext of ['.jpg', '.jpeg', '.png', '.webp']) {
        const candidate = path.join(dir, stem + ext);
        if (fsSync.existsSync(candidate))
            return candidate;
    }
    return null;
}
function getVideoDuration(videoPath) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(videoPath, (err, metadata) => {
            if (err)
                reject(err);
            else
                resolve(metadata.format.duration || 3);
        });
    });
}
async function extractFrame(videoPath, outputPath) {
    const duration = await getVideoDuration(videoPath);
    const timestamp = Math.max(1, duration * 0.3);
    return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
            .seekInput(timestamp)
            .frames(1)
            .videoFilter('scale=640:360:force_original_aspect_ratio=increase,crop=640:360')
            .output(outputPath)
            .on('end', () => resolve())
            .on('error', reject)
            .run();
    });
}
async function walkVideos(rootDir) {
    const results = [];
    async function walk(dir) {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                await walk(fullPath);
            }
            else if (entry.isFile()) {
                const ext = path.extname(entry.name).toLowerCase();
                if (IMAGE_EXTS.has(ext))
                    continue;
                if (!VIDEO_EXTS.has(ext))
                    continue;
                const rel = path.relative(rootDir, fullPath).replace(/\\/g, '/');
                const parts = rel.split('/');
                if (parts.length < 2)
                    continue;
                results.push({
                    absolutePath: fullPath,
                    relativePath: rel,
                    category: parts[0],
                    subcategory: parts.length >= 3 ? parts[parts.length - 2] : parts[0],
                });
            }
        }
    }
    await walk(rootDir);
    return results;
}
async function uploadToR2(s3, bucket, localPath, key, contentType) {
    const body = await fs.readFile(localPath);
    await s3.send(new client_s3_1.PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType }));
}
async function upsertCategory(name, sortOrder) {
    const existing = await prisma.brollCategory.findFirst({ where: { name } });
    if (existing)
        return existing;
    return prisma.brollCategory.create({ data: { name, sortOrder } });
}
async function upsertSubcategory(categoryId, name, sortOrder) {
    const existing = await prisma.brollSubcategory.findFirst({ where: { categoryId, name } });
    if (existing)
        return existing;
    return prisma.brollSubcategory.create({ data: { categoryId, name, sortOrder } });
}
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
    const catOrder = new Map();
    for (const f of files) {
        if (!catOrder.has(f.category))
            catOrder.set(f.category, catOrder.size);
    }
    if (REFRESH_METADATA) {
        console.log('🔁 REFRESH_METADATA=1 — updating existing items in place (no upload).\n');
        let updated = 0;
        let notFound = 0;
        for (const file of files) {
            const parsed = parseFilename(file.absolutePath);
            const category = await prisma.brollCategory.findFirst({ where: { name: file.category } });
            if (!category) {
                console.log(`  ?  no category for ${file.relativePath}`);
                notFound++;
                continue;
            }
            const subcategory = await prisma.brollSubcategory.findFirst({
                where: { categoryId: category.id, name: file.subcategory },
            });
            if (!subcategory) {
                console.log(`  ?  no subcategory for ${file.relativePath}`);
                notFound++;
                continue;
            }
            const s3Key = `brolls/${file.relativePath}`;
            const existing = (await prisma.brollItem.findUnique({ where: { s3Key } })) ??
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
                    nationality: parsed.nationality ?? null,
                },
            });
            console.log(`  ✏️  ${parsed.name} [g=${parsed.gender ?? '-'} e=${parsed.ethnicity ?? '-'} a=${parsed.age ?? '-'} n=${parsed.nationality ?? '-'}]`);
            updated++;
        }
        console.log(`\n✅ Refresh done — ${updated} updated, ${notFound} not matched.`);
        return;
    }
    const { client: s3, bucket, publicUrlBase } = buildR2Client();
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
        const { sortOrder, name, tags, gender, ethnicity, age, nationality } = parseFilename(file.absolutePath);
        const ext = path.extname(file.absolutePath).toLowerCase();
        const contentType = MIME_MAP[ext] || 'application/octet-stream';
        const category = await upsertCategory(file.category, catOrder.get(file.category) ?? 0);
        const subcategory = await upsertSubcategory(category.id, file.subcategory, 0);
        console.log(`  ⬆️  ${file.relativePath}`);
        await uploadToR2(s3, bucket, file.absolutePath, s3Key, contentType);
        const s3Url = toPublicUrl(publicUrlBase, s3Key);
        let thumbnailUrl = null;
        const thumbKey = s3Key.replace(/\.[^.]+$/, '-thumb.jpg');
        const sidecar = findSidecarThumbnail(file.absolutePath);
        if (sidecar) {
            const sidecarMime = MIME_MAP[path.extname(sidecar).toLowerCase()] || 'image/jpeg';
            await uploadToR2(s3, bucket, sidecar, thumbKey, sidecarMime);
            thumbnailUrl = toPublicUrl(publicUrlBase, thumbKey);
            console.log(`  🖼️  thumbnail: sidecar`);
        }
        else {
            const tmpThumb = path.join(os.tmpdir(), `cutflow-thumb-${Date.now()}.jpg`);
            try {
                await extractFrame(file.absolutePath, tmpThumb);
                await uploadToR2(s3, bucket, tmpThumb, thumbKey, 'image/jpeg');
                thumbnailUrl = toPublicUrl(publicUrlBase, thumbKey);
                console.log(`  🖼️  thumbnail: ffmpeg frame`);
            }
            catch (err) {
                console.warn(`  ⚠️  thumbnail failed: ${err.message}`);
            }
            finally {
                await fs.unlink(tmpThumb).catch(() => { });
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
                nationality: nationality ?? null,
            },
        });
        console.log(`  ✅ "${name}" [${tags.join(', ')}] g=${gender ?? '-'} e=${ethnicity ?? '-'} a=${age ?? '-'} n=${nationality ?? '-'}`);
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
//# sourceMappingURL=seed-brolls.js.map