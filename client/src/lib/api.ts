import { Lead, LeadSource, LeadStatus } from '../types/lead'

const API_BASE = '/api'

function getAuthHeader(): Record<string, string> {
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
  const query = new URLSearchParams()
  if (params?.search) query.set('search', params.search)
  if (params?.status && params.status !== 'All') query.set('status', params.status)
  if (params?.source && params.source !== 'All') query.set('source', params.source)
  if (params?.page) query.set('page', params.page.toString())
  if (params?.sort) query.set('sort', params.sort)

  const url = `${API_BASE}/leads?${query.toString()}`
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw errorData
  }

  return res.json()
}

export async function fetchLeadStats() {
  const res = await fetch(`${API_BASE}/leads/stats`, {
    headers: {
      ...getAuthHeader(),
    },
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw errorData
  }

  return res.json()
}

export async function createLeadApi(data: {
  name: string
  email: string
  phone: string
  company?: string | null
  source: LeadSource
  status: LeadStatus
}): Promise<Lead> {
  const res = await fetch(`${API_BASE}/leads`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw errorData
  }

  return res.json()
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
  const res = await fetch(`${API_BASE}/leads/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw errorData
  }

  return res.json()
}

export async function deleteLeadApi(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/leads/${id}`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeader(),
    },
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw errorData
  }
}
