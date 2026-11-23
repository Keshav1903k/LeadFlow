import seedLeadsData from '../data/leads.seed.json'
import { Lead, LeadSource, LeadStatus } from '../types/lead'

export const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api'

const STORAGE_KEY = 'leadflow_local_leads'

function getInitialLeads(): Lead[] {
  const now = Date.now()
  return seedLeadsData.map((item, index) => ({
    id: `lead-${index + 1}`,
    name: item.name,
    email: item.email,
    phone: item.phone,
    company: item.company || null,
    source: item.source as LeadSource,
    status: item.status as LeadStatus,
    createdAt: new Date(now - (item.daysAgo || 0) * 86400000).toISOString(),
    updatedAt: new Date(now - (item.daysAgo || 0) * 86400000).toISOString(),
  }))
}

function getStoredLeads(): Lead[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    const initial = getInitialLeads()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
    return initial
  }
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed
    }
    const initial = getInitialLeads()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
    return initial
  } catch {
    const initial = getInitialLeads()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
    return initial
  }
}

function saveStoredLeads(leads: Lead[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads))
  }
}

function getAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  const token = localStorage.getItem('leadflow_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function fetchLeads(params?: {
  search?: string
  status?: string
  source?: string
  page?: number
  sort?: string
}) {
  try {
    const query = new URLSearchParams()
    if (params?.search) query.set('search', params.search)
    if (params?.status && params.status !== 'All') query.set('status', params.status)
    if (params?.source && params.source !== 'All') query.set('source', params.source)
    if (params?.page) query.set('page', params.page.toString())
    if (params?.sort) query.set('sort', params.sort)

    const url = `${API_BASE}/leads?${query.toString()}`
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 1500)
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (res.ok) {
      return await res.json()
    }
  } catch {
    // API unreachable or serverless cold start - fallback to local store
  }

  const allLeads = getStoredLeads()
  const counts = {
    all: allLeads.length,
    New: allLeads.filter((l) => l.status === 'New').length,
    Contacted: allLeads.filter((l) => l.status === 'Contacted').length,
    Qualified: allLeads.filter((l) => l.status === 'Qualified').length,
    Lost: allLeads.filter((l) => l.status === 'Lost').length,
  }

  let filtered = [...allLeads]
  if (params?.search) {
    const q = params.search.toLowerCase()
    filtered = filtered.filter(
      (l) => l.name.toLowerCase().includes(q) || (l.company && l.company.toLowerCase().includes(q))
    )
  }

  if (params?.status && params.status !== 'All') {
    filtered = filtered.filter((l) => l.status === params.status)
  }

  if (params?.source && params.source !== 'All') {
    filtered = filtered.filter((l) => l.source === params.source)
  }

  const sortOrder = params?.sort === 'asc' ? 1 : -1
  filtered.sort(
    (a, b) => (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) * (sortOrder === 1 ? -1 : 1)
  )

  const page = params?.page || 1
  const pageSize = 10
  const totalPages = Math.ceil(filtered.length / pageSize) || 1
  const data = filtered.slice((page - 1) * pageSize, page * pageSize)

  return {
    data,
    total: filtered.length,
    page,
    totalPages,
    counts,
  }
}

export async function fetchLeadStats() {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 1500)
    const res = await fetch(`${API_BASE}/leads/stats`, {
      headers: getAuthHeader(),
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (res.ok) {
      return await res.json()
    }
  } catch {
    // API unreachable - fallback to local store
  }

  const allLeads = getStoredLeads()
  const totalLeads = allLeads.length
  const qualifiedLeads = allLeads.filter((l) => l.status === 'Qualified').length
  const conversionRate = totalLeads > 0 ? `${((qualifiedLeads / totalLeads) * 100).toFixed(1)}%` : '0%'
  const sevenDaysAgo = Date.now() - 7 * 86400000
  const addedThisWeek = allLeads.filter((l) => new Date(l.createdAt).getTime() >= sevenDaysAgo).length
  const pipeline = {
    New: allLeads.filter((l) => l.status === 'New').length,
    Contacted: allLeads.filter((l) => l.status === 'Contacted').length,
    Qualified: qualifiedLeads,
    Lost: allLeads.filter((l) => l.status === 'Lost').length,
  }
  const recentLeads = [...allLeads]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return {
    totalLeads,
    qualifiedLeads,
    conversionRate,
    addedThisWeek,
    pipeline,
    recentLeads,
  }
}

export async function createLeadApi(data: {
  name: string
  email: string
  phone: string
  company?: string | null
  source: LeadSource
  status: LeadStatus
}): Promise<Lead> {
  try {
    const res = await fetch(`${API_BASE}/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      const created = await res.json()
      const leads = getStoredLeads()
      leads.unshift(created)
      saveStoredLeads(leads)
      return created
    }
  } catch {
    // API down, use local
  }

  const newLead: Lead = {
    id: `lead-${Date.now()}`,
    name: data.name,
    email: data.email,
    phone: data.phone,
    company: data.company || null,
    source: data.source,
    status: data.status,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const leads = getStoredLeads()
  leads.unshift(newLead)
  saveStoredLeads(leads)
  return newLead
}

export async function updateLeadApi(
  id: string,
  data: Partial<{
    name: string
    email: string
    phone: string
    company?: string | null
    source: LeadSource
    status: LeadStatus
  }>
): Promise<Lead> {
  try {
    const res = await fetch(`${API_BASE}/leads/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      const updated = await res.json()
      const leads = getStoredLeads().map((l) => (l.id === id ? updated : l))
      saveStoredLeads(leads)
      return updated
    }
  } catch {
    // API down, use local
  }

  const leads = getStoredLeads()
  let updatedLead: Lead | undefined
  const updatedLeads = leads.map((l) => {
    if (l.id === id) {
      updatedLead = {
        ...l,
        ...data,
        updatedAt: new Date().toISOString(),
      }
      return updatedLead
    }
    return l
  })

  saveStoredLeads(updatedLeads)
  return updatedLead || (leads.find((l) => l.id === id) as Lead)
}

export async function deleteLeadApi(id: string): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/leads/${id}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeader(),
      },
    })
    if (res.ok) {
      const leads = getStoredLeads().filter((l) => l.id !== id)
      saveStoredLeads(leads)
      return
    }
  } catch {
    // API down, use local
  }

  const leads = getStoredLeads().filter((l) => l.id !== id)
  saveStoredLeads(leads)
}
