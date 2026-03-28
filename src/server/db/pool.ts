import pg from 'pg';
import { appConfig } from '../config.js';

const { Pool } = pg;

const needsSsl = appConfig.databaseUrl.includes('digitalocean') || appConfig.databaseUrl.includes('sslmode');
const cleanedUrl = appConfig.databaseUrl.replace(/[?&]sslmode=[^&]*/g, '').replace(/\?$/, '');

function buildSslConfig(): boolean | { rejectUnauthorized: boolean; ca?: string } {
  if (!needsSsl) return false;
  if (appConfig.databaseCaCert) {
    return { rejectUnauthorized: true, ca: appConfig.databaseCaCert };
  }
  return { rejectUnauthorized: false };
}

const pool = new Pool({
  connectionString: cleanedUrl,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ssl: buildSslConfig(),
});

pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err.message);
});

export async function checkDatabaseHealth(): Promise<boolean> {
  const result = await pool.query('SELECT 1 AS ok');
  return result.rows[0]?.ok === 1;
}

export async function closePool(): Promise<void> {
  await pool.end();
}

export const PG_UNIQUE_VIOLATION = '23505';

export function isPostgresError(error: unknown): error is { code: string; message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'string'
  );
}

export async function withTransaction<T>(fn: (client: pg.PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export default pool;
