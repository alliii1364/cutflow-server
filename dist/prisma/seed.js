"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new client_1.PrismaClient();
const VIDEOS = {
    blazes: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    escapes: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    fun: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    joyrides: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    meltdowns: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    bullrun: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    vw: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
    subaru: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
    grand: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
    elephants: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
};
const thumb = (seed) => `https://picsum.photos/seed/${encodeURIComponent(seed)}/320/180`;
async function main() {
    console.log('🌱 Seeding database for demo…\n');
    await seedPlans();
    await seedDemoUser();
    await seedBrollLibrary();
    console.log('\n✅ Seed complete!');
    console.log('   Demo login → demo@cutflow.app / Demo1234!');
}
async function seedPlans() {
    console.log('📋 Seeding plans…');
    const existing = await prisma.plan.findFirst({ where: { tier: 'FREE' } });
    if (existing) {
        console.log('   Plans already exist, skipping.');
        return;
    }
    await prisma.plan.createMany({
        data: [
            {
                name: 'Free',
                tier: 'FREE',
                priceMonthly: 0,
                priceYearly: 0,
                videoLimit: 3,
                maxVideoDuration: 60,
                maxStorageGb: 1,
                includesAiEditing: false,
                includesAiCaptions: false,
                includesAiVoice: false,
                includesAiAvatar: false,
                includesAiMusic: false,
                includes4K: false,
                sortOrder: 0,
            },
            {
                name: 'Starter',
                tier: 'STARTER',
                priceMonthly: 19,
                priceYearly: 190,
                videoLimit: 20,
                maxVideoDuration: 300,
                maxStorageGb: 10,
                includesAiEditing: true,
                includesAiCaptions: true,
                includesAiVoice: false,
                includesAiAvatar: false,
                includesAiMusic: false,
                includes4K: false,
                sortOrder: 1,
            },
            {
                name: 'Pro',
                tier: 'PRO',
                priceMonthly: 49,
                priceYearly: 490,
                videoLimit: 100,
                maxVideoDuration: 600,
                maxStorageGb: 50,
                includesAiEditing: true,
                includesAiCaptions: true,
                includesAiVoice: true,
                includesAiAvatar: true,
                includesAiMusic: true,
                includes4K: true,
                sortOrder: 2,
            },
        ],
        skipDuplicates: true,
    });
    console.log('   ✅ Created Free, Starter, Pro plans.');
}
async function seedDemoUser() {
    console.log('👤 Seeding demo user…');
    const email = 'demo@cutflow.app';
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        console.log('   Demo user already exists, skipping.');
        return;
    }
    const freePlan = await prisma.plan.findFirst({ where: { tier: 'FREE' } });
    if (!freePlan)
        throw new Error('Free plan not found — run seedPlans first');
    const passwordHash = await bcrypt.hash('Demo1234!', 10);
    await prisma.user.create({
        data: {
            email,
            passwordHash,
            firstName: 'Demo',
            lastName: 'User',
            emailVerified: true,
            subscription: {
                create: {
                    planId: freePlan.id,
                    status: 'ACTIVE',
                    currentPeriodStart: new Date(),
                    currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                },
            },
        },
    });
    console.log('   ✅ demo@cutflow.app / Demo1234!');
}
async function seedBrollLibrary() {
    console.log('🎬 Seeding B-roll library…');
    const existingCount = await prisma.brollCategory.count();
    if (existingCount > 0) {
        console.log('   B-roll library already seeded, skipping.');
        return;
    }
    const library = [
        {
            name: 'Nature',
            items: [
                {
                    subcategory: 'Landscapes',
                    items: [
                        { name: 'Mountain Drive', url: VIDEOS.joyrides, thumb: thumb('mountain-road'), duration: 15 },
                        { name: 'Scenic Escape', url: VIDEOS.escapes, thumb: thumb('nature-landscape'), duration: 15 },
                        { name: 'Open Roads', url: VIDEOS.subaru, thumb: thumb('forest-road'), duration: 45 },
                    ],
                },
                {
                    subcategory: 'Action Outdoors',
                    items: [
                        { name: 'Wild Blaze', url: VIDEOS.blazes, thumb: thumb('fire-outdoor'), duration: 15 },
                        { name: 'Fun In Nature', url: VIDEOS.fun, thumb: thumb('outdoor-fun'), duration: 60, isPremium: true },
                    ],
                },
            ],
        },
        {
            name: 'Business',
            items: [
                {
                    subcategory: 'Automotive & Review',
                    items: [
                        { name: 'Product Review', url: VIDEOS.vw, thumb: thumb('car-review'), duration: 55 },
                        { name: 'Test Drive', url: VIDEOS.subaru, thumb: thumb('test-drive'), duration: 45 },
                        { name: 'Car Showcase', url: VIDEOS.grand, thumb: thumb('car-showroom'), duration: 60, isPremium: true },
                    ],
                },
                {
                    subcategory: 'Events',
                    items: [
                        { name: 'Rally Event', url: VIDEOS.bullrun, thumb: thumb('event-crowd'), duration: 30 },
                        { name: 'Crowd Energy', url: VIDEOS.meltdowns, thumb: thumb('crowd-event'), duration: 15 },
                    ],
                },
            ],
        },
        {
            name: 'Cinematic',
            items: [
                {
                    subcategory: 'Short Films',
                    items: [
                        { name: 'Elephants Dream', url: VIDEOS.elephants, thumb: thumb('fantasy-film'), duration: 60, isPremium: true },
                        { name: 'City Rush', url: VIDEOS.joyrides, thumb: thumb('city-night'), duration: 15 },
                    ],
                },
                {
                    subcategory: 'Mood Clips',
                    items: [
                        { name: 'Dramatic Escape', url: VIDEOS.escapes, thumb: thumb('dramatic-sky'), duration: 15 },
                        { name: 'High Energy', url: VIDEOS.blazes, thumb: thumb('abstract-energy'), duration: 15 },
                        { name: 'Chill Vibes', url: VIDEOS.fun, thumb: thumb('sunset-calm'), duration: 60 },
                    ],
                },
            ],
        },
    ];
    let catIdx = 0;
    for (const catData of library) {
        const category = await prisma.brollCategory.create({
            data: { name: catData.name, sortOrder: catIdx++ },
        });
        console.log(`   📁 ${category.name}`);
        let subIdx = 0;
        for (const subData of catData.items) {
            const subcategory = await prisma.brollSubcategory.create({
                data: { categoryId: category.id, name: subData.subcategory, sortOrder: subIdx++ },
            });
            let itemIdx = 0;
            for (const item of subData.items) {
                const slug = `demo/${category.name.toLowerCase()}/${subData.subcategory.toLowerCase().replace(/\s+/g, '-')}/${item.name.toLowerCase().replace(/\s+/g, '-')}`;
                await prisma.brollItem.create({
                    data: {
                        subcategoryId: subcategory.id,
                        name: item.name,
                        description: `${item.name} — free stock clip`,
                        s3Key: slug,
                        s3Url: item.url,
                        thumbnailUrl: item.thumb,
                        type: 'video',
                        isPremium: item.isPremium ?? false,
                        duration: item.duration,
                        sortOrder: itemIdx++,
                    },
                });
                console.log(`      🎬 ${item.name}`);
            }
        }
    }
}
main()
    .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
})
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed.js.map