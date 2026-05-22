import * as dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Person registry: sortOrder (the "#N" prefix in filenames) → demographic data.
// All BrollItem rows with a matching sortOrder receive the same values, so a
// person who appears in several clips is updated everywhere in one pass.
//
// Source descriptors map straight through into the ethnicity column with one
// canonical lowercase value each:
//   White / Black / Asian / Spanish / Swedish / Italian / Brazilian /
//   Ukrainian / European / British  → ethnicity = lowercase form of that token
//
// #21 is intentionally absent (marked "x" in the source).

interface Person {
  name: string;
  age: number;
  gender: 'male' | 'female';
  ethnicity: string;
}

const PEOPLE: Record<number, Person> = {
  1:  { name: 'MacKenzie Miller',       age: 28, gender: 'female', ethnicity: 'white' },
  2:  { name: 'April Estrada',          age: 40, gender: 'female', ethnicity: 'white' },
  3:  { name: 'Akearah Judge',          age: 26, gender: 'female', ethnicity: 'black' },
  4:  { name: 'Alie Same',              age: 32, gender: 'female', ethnicity: 'asian' },
  5:  { name: 'Ava Graziano',           age: 21, gender: 'female', ethnicity: 'white' },
  6:  { name: 'Mariia Radionova',       age: 24, gender: 'female', ethnicity: 'white' },
  7:  { name: 'Saniyah Mondelus',       age: 22, gender: 'female', ethnicity: 'black' },
  8:  { name: 'Michael Aaronson',       age: 40, gender: 'male',   ethnicity: 'white' },
  9:  { name: 'Christopher Rothe',      age: 27, gender: 'male',   ethnicity: 'white' },
  10: { name: 'Juan Andres Freyle',     age: 26, gender: 'male',   ethnicity: 'white' },
  11: { name: 'Donald Betts',           age: 34, gender: 'male',   ethnicity: 'black' },
  12: { name: 'Lorizel Neris Garcia',   age: 20, gender: 'female', ethnicity: 'spanish' },
  13: { name: 'Veida Byers',            age: 21, gender: 'female', ethnicity: 'white' },
  14: { name: 'Greg Wickherst',         age: 50, gender: 'male',   ethnicity: 'white' },
  15: { name: 'Eli Torres',             age: 25, gender: 'female', ethnicity: 'white' },
  16: { name: 'Greg McConnell',         age: 39, gender: 'male',   ethnicity: 'white' },
  17: { name: 'Alice Cristea',          age: 20, gender: 'female', ethnicity: 'white' },
  18: { name: 'Irma Džindo',            age: 38, gender: 'female', ethnicity: 'swedish' },
  19: { name: 'Kaitlin Tinoco',         age: 24, gender: 'female', ethnicity: 'asian' },
  20: { name: 'Tobia Toccoli',          age: 20, gender: 'male',   ethnicity: 'italian' },
  // 21 — "x" in source, skipped
  22: { name: 'Julia Barreira',         age: 28, gender: 'female', ethnicity: 'brazilian' },
  23: { name: 'Anastasiia Vapniarchuk', age: 26, gender: 'female', ethnicity: 'ukrainian' },
  24: { name: 'Felicitas Arquiel',      age: 25, gender: 'female', ethnicity: 'european' },
  25: { name: 'Lauryn Goodwin',         age: 20, gender: 'female', ethnicity: 'white' },
  26: { name: "Greg McConnell's Wife",  age: 32, gender: 'female', ethnicity: 'white' },
  27: { name: 'Alondra Excene Shields', age: 35, gender: 'female', ethnicity: 'white' },
  28: { name: 'Briana Jones',           age: 27, gender: 'female', ethnicity: 'black' },
  29: { name: 'Ollie Graham',           age: 29, gender: 'male',   ethnicity: 'white' },
  30: { name: 'Svitlana Chasnok',       age: 33, gender: 'female', ethnicity: 'european' },
  31: { name: 'Lucia Brown',            age: 26, gender: 'female', ethnicity: 'british' },
};

(async () => {
  console.log(`👥 Backfilling ${Object.keys(PEOPLE).length} people across BrollItem rows...\n`);

  let totalUpdated = 0;
  const noRows: number[] = [];

  for (const [key, p] of Object.entries(PEOPLE)) {
    const sortOrder = Number(key);
    const result = await prisma.brollItem.updateMany({
      where: { sortOrder, isActive: true },
      data: {
        gender: p.gender,
        ethnicity: p.ethnicity,
        age: p.age,
      },
    });

    const tag = `g=${p.gender} a=${p.age} e=${p.ethnicity}`;
    if (result.count === 0) {
      noRows.push(sortOrder);
      console.log(`  ·  #${sortOrder.toString().padStart(2)} ${p.name.padEnd(28)} — 0 rows (no clips with this #)`);
    } else {
      totalUpdated += result.count;
      console.log(`  ✏️  #${sortOrder.toString().padStart(2)} ${p.name.padEnd(28)} — ${result.count} row(s)  [${tag}]`);
    }
  }

  const remainingNull = await prisma.brollItem.count({
    where: { isActive: true, gender: null },
  });

  console.log(`\n✅ Done. Updated ${totalUpdated} BrollItem row(s).`);
  if (noRows.length) console.log(`ℹ️  No clips found for #${noRows.join(', #')} — those persons have no videos in the DB.`);
  console.log(`ℹ️  ${remainingNull} active item(s) still have gender=null (sortOrder=0 / no #N prefix or no mapping entry).`);

  await prisma.$disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
