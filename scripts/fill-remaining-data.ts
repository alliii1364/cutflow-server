import * as dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Cleanup pass for items whose filename was just "#27"/"#27(1)" etc. — these
// parsed to sortOrder=0, but the name itself tells us which person they belong
// to. Match by name prefix and apply that person's demographic values.

interface OrphanFix {
  namePrefix: string;          // e.g. "#27" — matches "#27", "#27(1)", "#27 _ ..."
  person: string;
  gender: 'male' | 'female';
  ethnicity: string;
  age: number;
}

const ORPHAN_FIXES: OrphanFix[] = [
  { namePrefix: '#27', person: 'Alondra Excene Shields', gender: 'female', ethnicity: 'white', age: 35 },
  { namePrefix: '#28', person: 'Briana Jones',           gender: 'female', ethnicity: 'black', age: 27 },
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

  const total      = await prisma.brollItem.count({ where: { isActive: true } });
  const nullGender = await prisma.brollItem.count({ where: { isActive: true, gender: null } });

  console.log(`\n✅ Done. Updated ${totalUpdated} row(s). Active items: ${total}, gender=null: ${nullGender}`);

  await prisma.$disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
