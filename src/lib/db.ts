// ADR: Adopt Database Agnostic Architecture
// See: docs/decisions/0012-adopt-database-agnostic-architecture.md

import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function query<T = unknown>(text: string, params: unknown[] = []): Promise<T[]> {
  // Legacy wrapper to keep unmigrated code working during the transition
  // Note: Prisma uses $1, $2 syntax for Postgres, which matches our existing raw queries.
  return prisma.$queryRawUnsafe<T[]>(text, ...params);
}
