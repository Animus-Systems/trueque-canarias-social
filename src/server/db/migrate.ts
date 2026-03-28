import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pool, { closePool } from './pool.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.resolve(currentDir, '../../../database/migrations');

async function ensureMigrationsTable(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function applyMigrations(): Promise<void> {
  await ensureMigrationsTable();

  const files = (await readdir(migrationsDir))
    .filter((file) => file.endsWith('.sql'))
    .sort((left, right) => left.localeCompare(right));

  const appliedResult = await pool.query<{ filename: string }>('SELECT filename FROM schema_migrations');
  const appliedSet = new Set(appliedResult.rows.map((row) => row.filename));

  let applied = 0;
  let skipped = 0;

  for (const file of files) {
    if (appliedSet.has(file)) {
      skipped += 1;
      continue;
    }

    const sql = await readFile(path.join(migrationsDir, file), 'utf8');
    const client = await pool.connect();
    const startTime = Date.now();

    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
      await client.query('COMMIT');
      applied += 1;
      console.log(`Applied migration ${file} (${Date.now() - startTime}ms)`);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Migration ${file} failed after ${Date.now() - startTime}ms`);
      throw error;
    } finally {
      client.release();
    }
  }

  console.log(`Migrations: ${applied} applied, ${skipped} already up-to-date.`);
}

applyMigrations()
  .then(async () => {
    console.log('Database migrations complete.');
    await closePool();
  })
  .catch(async (error) => {
    console.error('Database migration failed:', error);
    await closePool();
    process.exitCode = 1;
  });
