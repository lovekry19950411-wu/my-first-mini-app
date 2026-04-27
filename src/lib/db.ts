import { Pool, type QueryResult, type QueryResultRow } from 'pg';

const globalForDb = globalThis as unknown as { pool?: Pool };

export const hasDatabase = Boolean(process.env.DATABASE_URL);

export const db = (() => {
  if (!hasDatabase) {
    return null;
  }

  if (!globalForDb.pool) {
    globalForDb.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false },
    });
  }

  return globalForDb.pool;
})();

export async function queryDb<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<QueryResult<T>> {
  if (!db) {
    throw new Error('DATABASE_URL is not configured');
  }

  return db.query<T>(text, params);
}
