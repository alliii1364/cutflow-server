"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require("dotenv");
dotenv.config();
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const PEOPLE = {
    1: { name: 'MacKenzie Miller', age: 28, gender: 'female', ethnicity: 'white', nationality: null },
    2: { name: 'April Estrada', age: 40, gender: 'female', ethnicity: 'white', nationality: null },
    3: { name: 'Akearah Judge', age: 26, gender: 'female', ethnicity: 'black', nationality: null },
    4: { name: 'Alie Same', age: 32, gender: 'female', ethnicity: 'asian', nationality: null },
    5: { name: 'Ava Graziano', age: 21, gender: 'female', ethnicity: 'white', nationality: null },
    6: { name: 'Mariia Radionova', age: 24, gender: 'female', ethnicity: 'white', nationality: null },
    7: { name: 'Saniyah Mondelus', age: 22, gender: 'female', ethnicity: 'black', nationality: null },
    8: { name: 'Michael Aaronson', age: 40, gender: 'male', ethnicity: 'white', nationality: null },
    9: { name: 'Christopher Rothe', age: 27, gender: 'male', ethnicity: 'white', nationality: null },
    10: { name: 'Juan Andres Freyle', age: 26, gender: 'male', ethnicity: 'white', nationality: null },
    11: { name: 'Donald Betts', age: 34, gender: 'male', ethnicity: 'black', nationality: null },
    12: { name: 'Lorizel Neris Garcia', age: 20, gender: 'female', ethnicity: 'spanish', nationality: null },
    13: { name: 'Veida Byers', age: 21, gender: 'female', ethnicity: 'white', nationality: null },
    14: { name: 'Greg Wickherst', age: 50, gender: 'male', ethnicity: 'white', nationality: null },
    15: { name: 'Eli Torres', age: 25, gender: 'female', ethnicity: 'white', nationality: null },
    16: { name: 'Greg McConnell', age: 39, gender: 'male', ethnicity: 'white', nationality: null },
    17: { name: 'Alice Cristea', age: 20, gender: 'female', ethnicity: 'white', nationality: null },
    18: { name: 'Irma Džindo', age: 38, gender: 'female', ethnicity: 'swedish', nationality: null },
    19: { name: 'Kaitlin Tinoco', age: 24, gender: 'female', ethnicity: 'asian', nationality: null },
    20: { name: 'Tobia Toccoli', age: 20, gender: 'male', ethnicity: 'italian', nationality: null },
    22: { name: 'Julia Barreira', age: 28, gender: 'female', ethnicity: 'brazilian', nationality: null },
    23: { name: 'Anastasiia Vapniarchuk', age: 26, gender: 'female', ethnicity: 'ukrainian', nationality: null },
    24: { name: 'Felicitas Arquiel', age: 25, gender: 'female', ethnicity: 'european', nationality: null },
    25: { name: 'Lauryn Goodwin', age: 20, gender: 'female', ethnicity: 'white', nationality: null },
    26: { name: "Greg McConnell's Wife", age: 32, gender: 'female', ethnicity: 'white', nationality: null },
    27: { name: 'Alondra Excene Shields', age: 35, gender: 'female', ethnicity: 'white', nationality: null },
    28: { name: 'Briana Jones', age: 27, gender: 'female', ethnicity: 'black', nationality: null },
    29: { name: 'Ollie Graham', age: 29, gender: 'male', ethnicity: 'white', nationality: null },
    30: { name: 'Svitlana Chasnok', age: 33, gender: 'female', ethnicity: 'european', nationality: null },
    31: { name: 'Lucia Brown', age: 26, gender: 'female', ethnicity: 'british', nationality: null },
};
(async () => {
    console.log(`👥 Backfilling ${Object.keys(PEOPLE).length} people across BrollItem rows...\n`);
    let totalUpdated = 0;
    const noRows = [];
    for (const [key, p] of Object.entries(PEOPLE)) {
        const sortOrder = Number(key);
        const result = await prisma.brollItem.updateMany({
            where: { sortOrder, isActive: true },
            data: {
                gender: p.gender,
                ethnicity: p.ethnicity,
                age: p.age,
                nationality: p.nationality,
            },
        });
        const tag = `g=${p.gender} a=${p.age} e=${p.ethnicity} n=${p.nationality ?? '-'}`;
        if (result.count === 0) {
            noRows.push(sortOrder);
            console.log(`  ·  #${sortOrder.toString().padStart(2)} ${p.name.padEnd(28)} — 0 rows (no clips with this #)`);
        }
        else {
            totalUpdated += result.count;
            console.log(`  ✏️  #${sortOrder.toString().padStart(2)} ${p.name.padEnd(28)} — ${result.count} row(s)  [${tag}]`);
        }
    }
    const remainingNull = await prisma.brollItem.count({
        where: { isActive: true, gender: null },
    });
    console.log(`\n✅ Done. Updated ${totalUpdated} BrollItem row(s).`);
    if (noRows.length)
        console.log(`ℹ️  No clips found for #${noRows.join(', #')} — those persons have no videos in the DB.`);
    console.log(`ℹ️  ${remainingNull} active item(s) still have gender=null (sortOrder=0 / no #N prefix or no mapping entry).`);
    await prisma.$disconnect();
})().catch((e) => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=backfill-broll-people.js.map