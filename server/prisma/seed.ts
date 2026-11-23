import { PrismaClient, LeadSource, LeadStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const prisma = new PrismaClient()

const sourceMap: Record<string, LeadSource> = {
  Referral: 'Referral',
  Website: 'Website',
  'Cold Call': 'Cold_Call',
  Facebook: 'Facebook',
  'Google Ads': 'Google_Ads',
  LinkedIn: 'LinkedIn',
  Other: 'Other',
}

async function main() {
  console.log('Seeding database...')

  // Create demo user
  const passwordHash = await bcrypt.hash('password123', 10)
  const demoUser = await prisma.user.upsert({
    where: { email: 'keshav@leadflow.app' },
    update: {
      name: 'Keshav Sharma',
      passwordHash,
    },
    create: {
      name: 'Keshav Sharma',
      email: 'keshav@leadflow.app',
      passwordHash,
    },
  })

  // Read leads.seed.json from project root
  const seedPath = path.resolve(__dirname, '../../leads.seed.json')
  const rawData = fs.readFileSync(seedPath, 'utf-8')
  const seedLeads = JSON.parse(rawData)

  // Clear existing leads for the demo user to avoid unique collisions
  await prisma.lead.deleteMany({
    where: { userId: demoUser.id },
  })

  const now = new Date()

  // Insert leads with spread createdAt dates
  for (const item of seedLeads) {
    const createdAt = new Date(now.getTime() - item.daysAgo * 24 * 60 * 60 * 1000)
    const prismaSource = sourceMap[item.source] || 'Website'

    await prisma.lead.create({
      data: {
        name: item.name,
        company: item.company || null,
        email: item.email,
        phone: item.phone,
        source: prismaSource,
        status: item.status as LeadStatus,
        createdAt,
        userId: demoUser.id,
      },
    })
  }

  console.log(`Seeded ${seedLeads.length} leads for user: ${demoUser.email}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
