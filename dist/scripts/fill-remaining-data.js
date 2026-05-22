"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require("dotenv");
dotenv.config();
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const ORPHAN_FIXES = [
    { namePrefix: '#27', person: 'Alondra Excene Shields', gender: 'female', ethnicity: 'white', age: 35 },
    { namePrefix: '#28', person: 'Briana Jones', gender: 'female', ethnicity: 'black', age: 27 },
];
(async () => {
    console.log('🔧 Backfilling orphaned #N-prefix clips\n');
    let totalUpdated = 0;
    for (const fix of ORPHAN_FIXES) {
        const result = await prisma.brollItem.updateMany({
            where: {
                isActive: true,
                sortOrder: 0,
                gender: null,
                name: { startsWith: fix.namePrefix },
            },
            data: {
                gender: fix.gender,
                ethnicity: fix.ethnicity,
                age: fix.age,
            },
        });
        totalUpdated += result.count;
        console.log(`  ${fix.namePrefix}* → ${fix.person.padEnd(28)} — ${result.count} row(s)`);
    }
    const total = await prisma.brollItem.count({ where: { isActive: true } });
    const nullGender = await prisma.brollItem.count({ where: { isActive: true, gender: null } });
    console.log(`\n✅ Done. Updated ${totalUpdated} row(s). Active items: ${total}, gender=null: ${nullGender}`);
    await prisma.$disconnect();
})().catch((e) => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=fill-remaining-data.js.map