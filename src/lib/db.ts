import { Pool } from "pg";

let pool: Pool | null = null;

export const hasDatabase = !!(process.env.POSTGRES_URL ?? process.env.DATABASE_URL);

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.POSTGRES_URL ?? process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    });
  }
  return pool;
}

export async function query(text: string, params: any[]) {
  if (!hasDatabase) return { rows: [], rowCount: 0 };
  const client = await getPool().connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

export async function queryDb(text: string, params: any[]) {
  return query(text, params);
}
