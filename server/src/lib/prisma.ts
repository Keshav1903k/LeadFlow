import bcrypt from 'bcryptjs'

// Initial 36 seed leads for fallback
const INITIAL_SEEDS = [
  { name: "Aarav Malhotra", company: "Malhotra Dental Clinic", email: "aarav@malhotradental.in", phone: "+91 98110 24763", source: "Referral", status: "New", daysAgo: 0 },
  { name: "Simran Kaur Bedi", company: null, email: "simran.bedi@gmail.com", phone: "+91 99530 18842", source: "Website", status: "New", daysAgo: 0 },
  { name: "Rohit Chaudhary", company: "Chaudhary Textile Exports", email: "rohit@chaudharytextiles.com", phone: "+91 98731 66205", source: "Cold_Call", status: "New", daysAgo: 1 },
  { name: "Meenal Iyer", company: "Brewlane Coffee Roasters", email: "meenal.iyer@brewlane.co", phone: "+91 70420 93381", source: "Facebook", status: "New", daysAgo: 1 },
  { name: "Tanmay Bhatnagar", company: "Bhatnagar Logistics", email: "tanmay@bhatnagarlogistics.in", phone: "+91 88265 41097", source: "Google_Ads", status: "New", daysAgo: 2 },
  { name: "Fatima Siddiqui", company: "Noor Interiors", email: "fatima@noorinteriors.in", phone: "+91 97118 53420", source: "LinkedIn", status: "New", daysAgo: 2 },
  { name: "Devansh Nambiar", company: "Nambiar Organic Farms", email: "devansh@nambiarfarms.com", phone: "+91 94471 29083", source: "Website", status: "New", daysAgo: 3 },
  { name: "Pooja Varma", company: "Varma Legal Associates", email: "pooja.varma@varmalegal.in", phone: "+91 98204 77195", source: "Referral", status: "New", daysAgo: 3 },
  { name: "Kunal Deshmukh", company: "Deshmukh Precision Tools", email: "kunal@deshmukhtools.com", phone: "+91 98220 44531", source: "Cold_Call", status: "New", daysAgo: 4 },
  { name: "Ananya Pillai", company: null, email: "ananya.pillai@outlook.com", phone: "+91 98470 63219", source: "Facebook", status: "New", daysAgo: 5 },
  { name: "Vikram Singhania", company: "Apex Industrial Supplies", email: "vikram@apexind.co.in", phone: "+91 98301 92847", source: "Google_Ads", status: "Contacted", daysAgo: 1 },
  { name: "Deepika Ranganathan", company: "Sanskriti Dance Academy", email: "deepika@sanskritidance.org", phone: "+91 98410 75329", source: "Website", status: "Contacted", daysAgo: 2 },
  { name: "Harshvardhan Oswal", company: "Oswal Paper & Packaging", email: "harsh@oswalpaper.com", phone: "+91 98290 31482", source: "LinkedIn", status: "Contacted", daysAgo: 2 },
  { name: "Sneha Kulkarni", company: null, email: "sneha.kulkarni@gmail.com", phone: "+91 98231 88046", source: "Referral", status: "Contacted", daysAgo: 3 },
  { name: "Manish Agarwal", company: "Shree Shyam Chemicals", email: "manish@shreeshyamchem.com", phone: "+91 98312 60914", source: "Cold_Call", status: "Contacted", daysAgo: 4 },
  { name: "Radhika Nair", company: "Kerela Ayurvedic Spa", email: "radhika@keralaayurspa.in", phone: "+91 94470 12895", source: "Facebook", status: "Contacted", daysAgo: 4 },
  { name: "Gaurav Sethi", company: "Sethi Auto Components", email: "gaurav@sethiauto.com", phone: "+91 98103 44781", source: "Google_Ads", status: "Contacted", daysAgo: 5 },
  { name: "Pallavi Joshi", company: "Joshi Architectural Studio", email: "pallavi@joshistudio.in", phone: "+91 98225 67190", source: "LinkedIn", status: "Contacted", daysAgo: 6 },
  { name: "Arjun Banerjee", company: "Bengal Craft Distillers", email: "arjun@bengalcraft.com", phone: "+91 98308 23419", source: "Website", status: "Contacted", daysAgo: 7 },
  { name: "Zoya Akhtar Mir", company: "Chinar Valley Handicrafts", email: "zoya@chinarvalley.com", phone: "+91 94190 55672", source: "Referral", status: "Contacted", daysAgo: 8 },
  { name: "Sameer Saxena", company: "Matrix IT Solutions", email: "sameer.saxena@matrixitsol.com", phone: "+91 98188 90123", source: "LinkedIn", status: "Qualified", daysAgo: 3 },
  { name: "Kavita Sundaram", company: "Sundaram Health Labs", email: "kavita@sundaramlabs.in", phone: "+91 98401 34567", source: "Website", status: "Qualified", daysAgo: 4 },
  { name: "Nikhil Tandon", company: "Tandon Cold Storage", email: "nikhil@tandongroup.co.in", phone: "+91 98270 78901", source: "Google_Ads", status: "Qualified", daysAgo: 5 },
  { name: "Ritika Wadhwa", company: "The Gourmet Bakery", email: "ritika@thegourmetbakery.in", phone: "+91 98712 34567", source: "Facebook", status: "Qualified", daysAgo: 6 },
  { name: "Prashant Hegde", company: "Hegde Solar Power", email: "prashant@hegdesolar.com", phone: "+91 94480 91234", source: "Referral", status: "Qualified", daysAgo: 7 },
  { name: "Sunil Grover", company: "Grover Transport Fleet", email: "sunil@grovertransport.in", phone: "+91 98115 67890", source: "Cold_Call", status: "Qualified", daysAgo: 9 },
  { name: "Bhavna Patel", company: null, email: "bhavna.patel88@gmail.com", phone: "+91 98250 12345", source: "Website", status: "Lost", daysAgo: 5 },
  { name: "Mohit Jindal", company: "Jindal Steel Fabricators", email: "mohit@jindalsteel.co", phone: "+91 98140 23456", source: "Cold_Call", status: "Lost", daysAgo: 6 },
  { name: "Tarun Gokhale", company: "Gokhale Fitness Club", email: "tarun@gokhalefitness.in", phone: "+91 98208 34567", source: "Facebook", status: "Lost", daysAgo: 7 },
  { name: "Smriti Rawat", company: "Doon Valley Boarding School", email: "smriti.rawat@doonvalley.edu.in", phone: "+91 94120 45678", source: "Google_Ads", status: "Lost", daysAgo: 8 },
  { name: "Chetan Somani", company: null, email: "chetan.somani@rediffmail.com", phone: "+91 98291 56789", source: "Referral", status: "Lost", daysAgo: 10 },
  { name: "Lavanya Reddy", company: "Reddy Diagnostic Services", email: "lavanya@reddydiagnostics.com", phone: "+91 98490 67890", source: "LinkedIn", status: "Lost", daysAgo: 11 },
  { name: "Rajat Bhalla", company: "Bhalla Real Estate", email: "rajat@bhallarealtors.in", phone: "+91 98105 78901", source: "Website", status: "Lost", daysAgo: 12 },
  { name: "Priyanka Solanki", company: "Solanki Heritage Homestay", email: "priyanka@solankihomestay.com", phone: "+91 98295 89012", source: "Facebook", status: "Lost", daysAgo: 13 },
  { name: "Anish Kaushik", company: "Kaushik Event Management", email: "anish@kaushikevents.com", phone: "+91 98180 90123", source: "Google_Ads", status: "Lost", daysAgo: 14 },
  { name: "Neeta Sen", company: null, email: "neeta.sen.kolkata@gmail.com", phone: "+91 98300 01234", source: "Cold_Call", status: "Lost", daysAgo: 15 },
]

function createInMemoryPrisma() {
  const users: any[] = [
    {
      id: "demo-user-1",
      name: "Keshav Sharma",
      email: "keshav@leadflow.app",
      passwordHash: bcrypt.hashSync("password123", 10),
      createdAt: new Date(),
    },
  ]

  const now = Date.now()
  const leads: any[] = INITIAL_SEEDS.map((item, idx) => ({
    id: `lead-${idx + 1}`,
    name: item.name,
    email: item.email,
    phone: item.phone,
    company: item.company,
    source: item.source,
    status: item.status,
    userId: "demo-user-1",
    createdAt: new Date(now - item.daysAgo * 86400000),
    updatedAt: new Date(now - item.daysAgo * 86400000),
  }))

  return {
    user: {
      async findUnique({ where }: any) {
        if (where.id) return users.find((u) => u.id === where.id) || null
        if (where.email) return users.find((u) => u.email.toLowerCase() === where.email.toLowerCase()) || null
        return null
      },
      async create({ data }: any) {
        const newUser = {
          id: `user-${Date.now()}`,
          name: data.name,
          email: data.email,
          passwordHash: data.passwordHash,
          createdAt: new Date(),
        }
        users.push(newUser)
        return newUser
      },
      async upsert({ where, update, create }: any) {
        let existing = users.find((u) => u.email.toLowerCase() === where.email.toLowerCase())
        if (existing) {
          Object.assign(existing, update)
          return existing
        }
        const created = {
          id: `user-${Date.now()}`,
          ...create,
          createdAt: new Date(),
        }
        users.push(created)
        return created
      },
    },
    lead: {
      async findMany(params: any = {}) {
        let result = [...leads]
        if (params.where) {
          if (params.where.userId) {
            result = result.filter((l) => l.userId === params.where.userId || params.where.userId === "demo-user-1")
          }
          if (params.where.status) {
            result = result.filter((l) => l.status === params.where.status)
          }
          if (params.where.source) {
            result = result.filter((l) => l.source === params.where.source)
          }
          if (params.where.OR) {
            result = result.filter((l) => {
              return params.where.OR.some((clause: any) => {
                if (clause.name?.contains) {
                  return l.name.toLowerCase().includes(clause.name.contains.toLowerCase())
                }
                if (clause.company?.contains) {
                  return (l.company || "").toLowerCase().includes(clause.company.contains.toLowerCase())
                }
                return false
              })
            })
          }
        }

        if (params.orderBy?.createdAt) {
          const isAsc = params.orderBy.createdAt === "asc"
          result.sort((a, b) => (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) * (isAsc ? -1 : 1))
        }

        if (typeof params.skip === "number") {
          result = result.slice(params.skip)
        }
        if (typeof params.take === "number") {
          result = result.slice(0, params.take)
        }

        return result
      },
      async count(params: any = {}) {
        const found = await this.findMany({ where: params.where })
        return found.length
      },
      async findUnique({ where }: any) {
        if (where.id) return leads.find((l) => l.id === where.id) || null
        if (where.userId_email) {
          return (
            leads.find(
              (l) =>
                (l.userId === where.userId_email.userId || where.userId_email.userId === "demo-user-1") &&
                l.email.toLowerCase() === where.userId_email.email.toLowerCase()
            ) || null
          )
        }
        return null
      },
      async create({ data }: any) {
        const newLead = {
          id: `lead-${Date.now()}`,
          name: data.name,
          email: data.email,
          phone: data.phone,
          company: data.company || null,
          source: data.source,
          status: data.status,
          userId: data.userId || "demo-user-1",
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        leads.unshift(newLead)
        return newLead
      },
      async update({ where, data }: any) {
        const idx = leads.findIndex((l) => l.id === where.id)
        if (idx !== -1) {
          leads[idx] = {
            ...leads[idx],
            ...data,
            updatedAt: new Date(),
          }
          return leads[idx]
        }
        return null
      },
      async delete({ where }: any) {
        const idx = leads.findIndex((l) => l.id === where.id)
        if (idx !== -1) {
          const deleted = leads.splice(idx, 1)[0]
          return deleted
        }
        return null
      },
      async deleteMany({ where }: any) {
        return { count: 0 }
      },
    },
  }
}

function initializePrisma(): any {
  try {
    // Dynamic require so esbuild won't break if @prisma/client is missing
    const { PrismaClient } = require('@prisma/client')
    const raw = process.env.DATABASE_URL
    let dbUrl = raw

    if (raw) {
      try {
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
            dbUrl = `${raw.substring(0, schemeEnd + 3)}${user}:${encodedPass}@${rest}`
          }
        }
      } catch {
        dbUrl = raw
      }
    }

    if (dbUrl) {
      return new PrismaClient({
        datasources: { db: { url: dbUrl } },
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      })
    }
  } catch (err) {
    console.warn('PrismaClient initialization skipped or unavailable, using resilient in-memory store.')
  }

  return createInMemoryPrisma()
}

const globalForPrisma = globalThis as unknown as { prisma: any }
export const prisma: any = globalForPrisma.prisma || initializePrisma()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
