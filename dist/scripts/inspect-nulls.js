"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require("dotenv");
dotenv.config();
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
(async () => {
    const total = await prisma.brollItem.count({ where: { isActive: true } });
    const nullGender = await prisma.brollItem.count({ where: { isActive: true, gender: null } });
    const nullEthnicity = await prisma.brollItem.count({ where: { isActive: true, ethnicity: null } });
    const nullAge = await prisma.brollItem.count({ where: { isActive: true, age: null } });
    console.log(`Total active items: ${total}`);
    console.log(`  gender=null    : ${nullGender}`);
    console.log(`  ethnicity=null : ${nullEthnicity}`);
    console.log(`  age=null       : ${nullAge}`);
    const orphans = await prisma.brollItem.findMany({
        where: { isActive: true, gender: null },
        select: { id: true, name: true, sortOrder: true, subcategory: { select: { name: true, category: { select: { name: true } } } } },
        orderBy: [{ subcategory: { name: 'asc' } }, { name: 'asc' }],
    });
    console.log(`\nItems with no demographic data (${orphans.length}):`);
    for (const o of orphans) {
        console.log(`  [#${o.sortOrder}] ${o.subcategory.category.name} / ${o.subcategory.name} — "${o.name}"`);
    }
    await prisma.$disconnect();
})();
//# sourceMappingURL=inspect-nulls.js.map