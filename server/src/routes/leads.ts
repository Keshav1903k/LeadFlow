import { Router, Response } from 'express'
import { prisma } from '../lib/prisma.js'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { createLeadSchema, updateLeadSchema } from '../schemas/leadSchema.js'
import { LeadSource, LeadStatus, Prisma } from '@prisma/client'

export const leadsRouter = Router()

leadsRouter.use(authMiddleware)

function formatSource(source: LeadSource): string {
  if (source === 'Cold_Call') return 'Cold Call'
  if (source === 'Google_Ads') return 'Google Ads'
  return source
}

function toPrismaSource(source: string): LeadSource {
  if (source === 'Cold Call') return 'Cold_Call'
  if (source === 'Google Ads') return 'Google_Ads'
  return source as LeadSource
}

// GET /api/leads/stats
leadsRouter.get('/stats', async (req: AuthRequest, res: Response) => {
  const userId = req.userId!

  const leads = await prisma.lead.findMany({
    where: { userId },
    select: { id: true, name: true, email: true, phone: true, company: true, source: true, status: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })

  const total = leads.length
  const counts: Record<string, number> = {
    New: 0,
    Contacted: 0,
    Qualified: 0,
    Lost: 0,
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  let addedThisWeek = 0

  for (const lead of leads) {
    if (counts[lead.status] !== undefined) {
      counts[lead.status]++
    }
    if (lead.createdAt >= sevenDaysAgo) {
      addedThisWeek++
    }
  }

  const qualifiedCount = counts.Qualified || 0
  const conversionRate = total > 0 ? ((qualifiedCount / total) * 100).toFixed(1) : '0'

  const recentLeads = leads.slice(0, 5).map((l) => ({
    ...l,
    source: formatSource(l.source),
  }))

  res.json({
    total,
    counts,
    conversionRate: `${conversionRate}%`,
    addedThisWeek,
    recentLeads,
  })
})

// GET /api/leads
leadsRouter.get('/', async (req: AuthRequest, res: Response) => {
  const userId = req.userId!
  const { search, status, source, page = '1', sort = 'desc' } = req.query

  const pageNum = Math.max(1, parseInt(page as string, 10) || 1)
  const pageSize = 10
  const sortDirection: Prisma.SortOrder = sort === 'asc' ? 'asc' : 'desc'

  const where: Prisma.LeadWhereInput = { userId }

  if (status && status !== 'All') {
    where.status = status as LeadStatus
  }

  if (source && source !== 'All') {
    where.source = toPrismaSource(source as string)
  }

  if (search && typeof search === 'string' && search.trim() !== '') {
    const q = search.trim()
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { company: { contains: q, mode: 'insensitive' } },
    ]
  }

  const total = await prisma.lead.count({ where })

  const allUserLeads = await prisma.lead.findMany({
    where: { userId },
    select: { status: true },
  })

  const statusCounts: Record<string, number> = {
    All: allUserLeads.length,
    New: 0,
    Contacted: 0,
    Qualified: 0,
    Lost: 0,
  }

  for (const l of allUserLeads) {
    if (statusCounts[l.status] !== undefined) {
      statusCounts[l.status]++
    }
  }

  const rawLeads = await prisma.lead.findMany({
    where,
    orderBy: { createdAt: sortDirection },
    skip: (pageNum - 1) * pageSize,
    take: pageSize,
  })

  const leads = rawLeads.map((l) => ({
    ...l,
    source: formatSource(l.source),
  }))

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  res.json({
    leads,
    total,
    page: pageNum,
    totalPages,
    statusCounts,
  })
})

// POST /api/leads
leadsRouter.post('/', validate(createLeadSchema), async (req: AuthRequest, res: Response) => {
  const userId = req.userId!
  const { name, email, phone, company, source, status } = req.body

  const existing = await prisma.lead.findUnique({
    where: {
      userId_email: {
        userId,
        email,
      },
    },
  })

  if (existing) {
    return res.status(409).json({
      error: 'A lead with this email already exists',
      fields: { email: 'A lead with this email already exists' },
    })
  }

  const created = await prisma.lead.create({
    data: {
      name,
      email,
      phone,
      company: company || null,
      source: toPrismaSource(source),
      status,
      userId,
    },
  })

  res.status(201).json({
    ...created,
    source: formatSource(created.source),
  })
})

// PUT /api/leads/:id
leadsRouter.put('/:id', validate(updateLeadSchema), async (req: AuthRequest, res: Response) => {
  const userId = req.userId!
  const id = req.params.id
  const { name, email, phone, company, source, status } = req.body

  const lead = await prisma.lead.findFirst({
    where: { id, userId },
  })

  if (!lead) {
    return res.status(404).json({ error: 'Lead not found' })
  }

  if (email && email.toLowerCase() !== lead.email.toLowerCase()) {
    const existing = await prisma.lead.findUnique({
      where: {
        userId_email: {
          userId,
          email,
        },
      },
    })
    if (existing) {
      return res.status(409).json({
        error: 'A lead with this email already exists',
        fields: { email: 'A lead with this email already exists' },
      })
    }
  }

  const data: Prisma.LeadUpdateInput = {}
  if (name !== undefined) data.name = name
  if (email !== undefined) data.email = email
  if (phone !== undefined) data.phone = phone
  if (company !== undefined) data.company = company || null
  if (source !== undefined) data.source = toPrismaSource(source)
  if (status !== undefined) data.status = status

  const updated = await prisma.lead.update({
    where: { id },
    data,
  })

  res.json({
    ...updated,
    source: formatSource(updated.source),
  })
})

// DELETE /api/leads/:id
leadsRouter.delete('/:id', async (req: AuthRequest, res: Response) => {
  const userId = req.userId!
  const id = req.params.id

  const lead = await prisma.lead.findFirst({
    where: { id, userId },
  })

  if (!lead) {
    return res.status(404).json({ error: 'Lead not found' })
  }

  await prisma.lead.delete({
    where: { id },
  })

  res.json({ message: 'Lead deleted successfully' })
})
