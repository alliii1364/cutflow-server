"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require("dotenv");
dotenv.config();
const client_1 = require("@prisma/client");
const client_s3_1 = require("@aws-sdk/client-s3");
const fs = require("fs/promises");
const fsSync = require("fs");
const path = require("path");
const prisma = new client_1.PrismaClient();
function buildR2Client() {
    const accountId = process.env.R2_ACCOUNT_ID;
    if (!accountId)
        throw new Error('R2_ACCOUNT_ID is required in .env');
    const bucket = process.env.R2_BUCKET_NAME || 'cutflow-media';
    const publicUrlBase = process.env.R2_PUBLIC_URL || '';
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
    const tags = rest
        .slice(dotIdx + 2)
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
    return { sortOrder, name, tags };
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
async function walkVideos(rootDir) {
    const results = [];
    async function walk(dir) {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                await walk(fullPath);
            }
            else if (entry.isFile() && MIME_MAP[path.extname(entry.name).toLowerCase()]) {
                const rel = path.relative(rootDir, fullPath).replace(/\\/g, '/');
                const parts = rel.split('/');
                if (parts.length < 2)
                    continue;
                const category = parts[0];
                const subcategory = parts.length >= 3 ? parts[parts.length - 2] : parts[0];
                results.push({ absolutePath: fullPath, relativePath: rel, category, subcategory });
            }
        }
    }
    await walk(rootDir);
    return results;
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
    if (!fsSync.existsSync(ASSETS_DIR)) {
        console.error(`❌ Not found: ${ASSETS_DIR}`);
        console.error('   Create assets/videos/<Category>/<Subcategory>/<files> and re-run.');
        process.exit(1);
    }
    const { client: s3, bucket, publicUrlBase } = buildR2Client();
    console.log('🎬 Walking assets/videos/...\n');
    const files = await walkVideos(ASSETS_DIR);
    console.log(`Found ${files.length} media file(s)\n`);
    const catOrder = new Map();
    for (const f of files) {
        if (!catOrder.has(f.category))
            catOrder.set(f.category, catOrder.size);
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
        await s3.send(new client_s3_1.PutObjectCommand({ Bucket: bucket, Key: s3Key, Body: body, ContentType: contentType }));
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
//# sourceMappingURL=seed-brolls.js.map