"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting database seed...\n');
    await seedBrollLibrary();
    console.log('\n✅ Database seed completed!');
}
async function seedBrollLibrary() {
    console.log('📚 Seeding B-roll Library...');
    const existingCategories = await prisma.brollCategory.count();
    if (existingCategories > 0) {
        console.log('   B-roll library already seeded, skipping...');
        return;
    }
    const categories = [
        {
            name: 'Nature',
            subcategories: [
                {
                    name: 'Landscapes',
                    items: [
                        { name: 'Mountain Sunrise', type: 'video', isPremium: false },
                        { name: 'Ocean Waves', type: 'video', isPremium: false },
                        { name: 'Forest Path', type: 'video', isPremium: true },
                    ],
                },
                {
                    name: 'Weather',
                    items: [
                        { name: 'Rainy Day', type: 'video', isPremium: false },
                        { name: 'Snow Falling', type: 'video', isPremium: true },
                        { name: 'Cloudy Sky', type: 'video', isPremium: false },
                    ],
                },
            ],
        },
        {
            name: 'Business',
            subcategories: [
                {
                    name: 'Office',
                    items: [
                        { name: 'Team Meeting', type: 'video', isPremium: false },
                        { name: 'Working on Laptop', type: 'video', isPremium: false },
                        { name: 'Modern Office', type: 'video', isPremium: true },
                    ],
                },
                {
                    name: 'Technology',
                    items: [
                        { name: 'Typing Code', type: 'video', isPremium: false },
                        { name: 'Data Center', type: 'video', isPremium: true },
                        { name: 'Server Room', type: 'video', isPremium: true },
                    ],
                },
            ],
        },
        {
            name: 'Lifestyle',
            subcategories: [
                {
                    name: 'People',
                    items: [
                        { name: 'Walking in City', type: 'video', isPremium: false },
                        { name: 'Coffee Shop', type: 'video', isPremium: false },
                        { name: 'Reading Book', type: 'video', isPremium: true },
                    ],
                },
                {
                    name: 'Food',
                    items: [
                        { name: 'Cooking', type: 'video', isPremium: false },
                        { name: 'Restaurant', type: 'video', isPremium: true },
                        { name: 'Fresh Vegetables', type: 'video', isPremium: false },
                    ],
                },
            ],
        },
    ];
    for (const [catIndex, catData] of categories.entries()) {
        const category = await prisma.brollCategory.create({
            data: {
                name: catData.name,
                sortOrder: catIndex,
            },
        });
        console.log(`   ✅ Created category: ${category.name}`);
        for (const [subIndex, subData] of catData.subcategories.entries()) {
            const subcategory = await prisma.brollSubcategory.create({
                data: {
                    categoryId: category.id,
                    name: subData.name,
                    sortOrder: subIndex,
                },
            });
            console.log(`      📁 Created subcategory: ${subcategory.name}`);
            for (const [itemIndex, itemData] of subData.items.entries()) {
                await prisma.brollItem.create({
                    data: {
                        subcategoryId: subcategory.id,
                        name: itemData.name,
                        description: `${itemData.name} - ${subData.name}`,
                        s3Key: `broll/${category.id}/${subcategory.id}/${itemData.name.toLowerCase().replace(/\s+/g, '-')}.mp4`,
                        s3Url: `https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4`,
                        thumbnailUrl: `https://via.placeholder.com/320x180/4F46E5/ffffff?text=${encodeURIComponent(itemData.name)}`,
                        type: itemData.type,
                        isPremium: itemData.isPremium,
                        sortOrder: itemIndex,
                    },
                });
                console.log(`         🎬 Created item: ${itemData.name}${itemData.isPremium ? ' (Pro)' : ''}`);
            }
        }
    }
}
main()
    .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map