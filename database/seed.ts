import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { config as loadEnv } from 'dotenv';

loadEnv();

const currentDir = path.dirname(fileURLToPath(import.meta.url));

interface SeedEntry {
  skillNameEn: string;
  skillNameEs: string;
  itemNameEn: string;
  itemNameEs: string;
  ratio: number;
  offerUnit: string;
  receiveUnit: string;
  bananaValue: number | null;
  descriptionEn: string;
  descriptionEs: string;
  sourceAttribution: string;
}

async function seed() {
  const dbUrl = process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5433/trueque_canarias_social';
  const isRemote = dbUrl.includes('digitalocean') || dbUrl.includes('sslmode');
  const pool = new pg.Pool({
    connectionString: dbUrl,
    ssl: isRemote ? { rejectUnauthorized: false } : false,
  });

  try {
    const raw = await readFile(path.join(currentDir, 'seed-data.json'), 'utf8');
    const entries: SeedEntry[] = JSON.parse(raw);

    console.log(`Loading ${entries.length} seed entries...`);

    let imported = 0;
    let skipped = 0;

    for (const entry of entries) {
      const exists = await pool.query(
        `SELECT id FROM equivalents
         WHERE similarity(skill_name_en, $1) > 0.6 AND similarity(item_name_en, $2) > 0.6
         LIMIT 1`,
        [entry.skillNameEn, entry.itemNameEn]
      );

      if (exists.rows.length > 0) {
        console.log(`  Skipped (duplicate): ${entry.skillNameEn} ↔ ${entry.itemNameEn}`);
        skipped++;
        continue;
      }

      await pool.query(
        `INSERT INTO equivalents (
           skill_name_en, skill_name_es, item_name_en, item_name_es,
           ratio, offer_unit, receive_unit, description_en, description_es,
           banana_value, status, source_type, source_attribution
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'approved', 'official', $11)`,
        [
          entry.skillNameEn, entry.skillNameEs,
          entry.itemNameEn, entry.itemNameEs,
          entry.ratio, entry.offerUnit, entry.receiveUnit,
          entry.descriptionEn, entry.descriptionEs,
          entry.bananaValue,
          entry.sourceAttribution,
        ]
      );

      console.log(`  Imported: ${entry.skillNameEn} ↔ ${entry.itemNameEn}`);
      imported++;
    }

    console.log(`\nDone: ${imported} imported, ${skipped} skipped (duplicates).`);
  } catch (error) {
    console.error('Seed failed:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

seed();
