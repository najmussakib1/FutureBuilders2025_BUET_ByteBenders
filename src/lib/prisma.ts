// Cache bust: 2025-12-28T13:10:00
import { PrismaClient } from '../generated/client'
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
