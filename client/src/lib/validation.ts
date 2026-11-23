import { z } from 'zod'

export const leadSources = [
  'Referral',
  'Website',
  'Cold Call',
  'Facebook',
  'Google Ads',
  'LinkedIn',
  'Other',
] as const

export const leadStatuses = [
  'New',
  'Contacted',
  'Qualified',
  'Lost',
] as const

export const leadSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().trim().min(1, 'Email is required').email('Please enter a valid email address'),
  phone: z
    .string()
    .trim()
    .min(1, 'Phone number is required')
    .regex(/^[+]?[0-9\s\-()]{7,20}$/, 'Please enter a valid phone number'),
  company: z.string().trim().optional().nullable(),
  source: z.enum(leadSources),
  status: z.enum(leadStatuses),
})

export type LeadFormData = z.infer<typeof leadSchema>
