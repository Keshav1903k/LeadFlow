import { PrismaClient } from '@prisma/client'

function getDatabaseUrl(): string | undefined {
  const raw = process.env.DATABASE_URL
  if (!raw) return undefined

  try {
    const atIndices: number[] = []
    for (let i = 0; i < raw.length; i++) {
      if (raw[i] === '@') atIndices.push(i)
    }

    if (atIndices.length > 1) {
      const schemeEnd = raw.indexOf('://')
      if (schemeEnd !== -1) {
        const afterScheme = raw.substring(schemeEnd + 3)
        const colonIdx = afterScheme.indexOf(':')
        const lastAtIdx = afterScheme.lastIndexOf('@')
        if (colonIdx !== -1 && lastAtIdx !== -1 && lastAtIdx > colonIdx) {
          const user = afterScheme.substring(0, colonIdx)
          const rawPass = afterScheme.substring(colonIdx + 1, lastAtIdx)
          const rest = afterScheme.substring(lastAtIdx + 1)
          const encodedPass = encodeURIComponent(decodeURIComponent(rawPass))
          return `${raw.substring(0, schemeEnd + 3)}${user}:${encodedPass}@${rest}`
        }
      }
    }
  } catch {
    // fallback to raw string
  }

  return raw
}

const dbUrl = getDatabaseUrl()

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: dbUrl ? { db: { url: dbUrl } } : undefined,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

