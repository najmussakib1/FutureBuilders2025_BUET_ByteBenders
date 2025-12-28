// Cache bust: 2025-12-28T13:10:00
if (typeof window !== 'undefined') {
  throw new Error('prisma must only be imported on the server')
}
import { PrismaClient } from '../generated/client/index.js'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pool: Pool | undefined
}

const pool = globalForPrisma.pool ?? new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)

export const db = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
  globalForPrisma.pool = pool
}

// Provide `prisma` named export for scripts that import `{ prisma }`
export const prisma = db
