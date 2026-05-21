import * as dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Two cleanup passes:
// 1. Items whose filename was just "#27"/"#27(1)" etc. parsed to sortOrder=0 — but
//    the name itself tells us which person they belong to. Match by name prefix
//    and apply that person's demographic values.
// 2. Where ethnicity already names a country (british/spanish/italian/brazilian),
//    mirror it into the nationality column so the nationality UI filter has
//    something to bite on.

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

// Ethnicity values that double as nationalities in our filter set.
const ETHNICITY_TO_NATIONALITY = ['british', 'spanish', 'italian', 'brazilian'] as const;

(async () => {
  // ── Pass 1: Backfill orphaned #N-named clips ──────────────────────────────
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

  // ── Pass 2: Mirror country-like ethnicity values into nationality ─────────
  console.log('\n🌍 Pass 2: deriving nationality from ethnicity\n');

  for (const code of ETHNICITY_TO_NATIONALITY) {
    const result = await prisma.brollItem.updateMany({
      where: { isActive: true, ethnicity: code, nationality: null },
      data: { nationality: code },
    });
    console.log(`  ethnicity=${code.padEnd(9)} → nationality=${code.padEnd(9)} — ${result.count} row(s)`);
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  const total      = await prisma.brollItem.count({ where: { isActive: true } });
  const nullGender = await prisma.brollItem.count({ where: { isActive: true, gender: null } });
  const nullNat    = await prisma.brollItem.count({ where: { isActive: true, nationality: null } });

  console.log(`\n✅ Done. Active items: ${total}`);
  console.log(`   gender=null      : ${nullGender}`);
  console.log(`   nationality=null : ${nullNat}`);

  await prisma.$disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
