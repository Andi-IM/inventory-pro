// ADR: Adopt Neon Auth for Authentication
// See: docs/decisions/0004-adopt-neon-auth-for-authentication.md

import { Pool } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is missing');
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function query<T = unknown>(text: string, params?: unknown[]): Promise<T[]> {
  const res = await pool.query(text, params);
  return res.rows;
}
