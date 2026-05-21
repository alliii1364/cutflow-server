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
const ETHNICITY_TO_NATIONALITY = ['british', 'spanish', 'italian', 'brazilian'];
(async () => {
    console.log('🔧 Pass 1: orphaned #N-prefix clips\n');
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
        console.log(`  ${fix.namePrefix}* → ${fix.person.padEnd(28)} — ${result.count} row(s)`);
    }
    console.log('\n🌍 Pass 2: deriving nationality from ethnicity\n');
    for (const code of ETHNICITY_TO_NATIONALITY) {
        const result = await prisma.brollItem.updateMany({
            where: { isActive: true, ethnicity: code, nationality: null },
            data: { nationality: code },
        });
        console.log(`  ethnicity=${code.padEnd(9)} → nationality=${code.padEnd(9)} — ${result.count} row(s)`);
    }
    const total = await prisma.brollItem.count({ where: { isActive: true } });
    const nullGender = await prisma.brollItem.count({ where: { isActive: true, gender: null } });
    const nullNat = await prisma.brollItem.count({ where: { isActive: true, nationality: null } });
    console.log(`\n✅ Done. Active items: ${total}`);
    console.log(`   gender=null      : ${nullGender}`);
    console.log(`   nationality=null : ${nullNat}`);
    await prisma.$disconnect();
})().catch((e) => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=fill-remaining-data.js.map