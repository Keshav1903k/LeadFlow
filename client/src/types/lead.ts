export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Lost'

export type LeadSource =
  | 'Referral'
  | 'Website'
  | 'Cold Call'
  | 'Facebook'
  | 'Google Ads'
  | 'LinkedIn'
  | 'Other'

export interface Lead {
  id: string
  name: string
  company: string | null
  email: string
  phone: string
  source: LeadSource
  status: LeadStatus
  createdAt: string
  updatedAt?: string
}

export type SortOrder = 'desc' | 'asc'
