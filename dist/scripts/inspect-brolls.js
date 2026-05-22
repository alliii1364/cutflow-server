"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require("dotenv");
dotenv.config();
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
(async () => {
    const total = await prisma.brollItem.count();
    const sample = await prisma.brollItem.findMany({
        take: 10,
        select: { id: true, name: true, tags: true, gender: true, ethnicity: true, age: true },
    });
    console.log('TOTAL_ITEMS:', total);
    console.log('SAMPLE:', JSON.stringify(sample, null, 2));
    const rows = await prisma.brollItem.findMany({ select: { sortOrder: true } });
    const counts = new Map();
    for (const r of rows)
        counts.set(r.sortOrder, (counts.get(r.sortOrder) ?? 0) + 1);
    const sorted = [...counts.entries()].sort((a, b) => a[0] - b[0]);
    console.log('SORT_ORDER_DISTRIBUTION (sortOrder → row count):');
    for (const [k, v] of sorted)
        console.log(`  #${k}: ${v}`);
    await prisma.$disconnect();
})();
//# sourceMappingURL=inspect-brolls.js.map