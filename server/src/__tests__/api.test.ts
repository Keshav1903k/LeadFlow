import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = 'super_secret_jwt_key_change_in_production'

// In-memory test store
let users: any[] = []
let leads: any[] = []

vi.mock('../lib/prisma.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(async ({ where }: any) => {
        if (where.email) return users.find((u) => u.email === where.email) || null
        if (where.id) return users.find((u) => u.id === where.id) || null
        return null
      }),
      create: vi.fn(async ({ data }: any) => {
        const user = { id: `user-${Date.now()}`, ...data, createdAt: new Date() }
        users.push(user)
        return user
      }),
      findFirst: vi.fn(async () => users[0] || null),
    },
    lead: {
      findUnique: vi.fn(async ({ where }: any) => {
        if (where.userId_email) {
          return (
            leads.find(
              (l) =>
                l.userId === where.userId_email.userId &&
                l.email === where.userId_email.email
            ) || null
          )
        }
        return null
      }),
      findFirst: vi.fn(async ({ where }: any) => {
        return (
          leads.find((l) => {
            if (where.id && l.id !== where.id) return false
            if (where.userId && l.userId !== where.userId) return false
            return true
          }) || null
        )
      }),
      findMany: vi.fn(async ({ where }: any) => {
        return leads.filter((l) => {
          if (where.userId && l.userId !== where.userId) return false
          if (where.status && l.status !== where.status) return false
          return true
        })
      }),
      count: vi.fn(async ({ where }: any) => {
        return leads.filter((l) => {
          if (where.userId && l.userId !== where.userId) return false
          if (where.status && l.status !== where.status) return false
          return true
        }).length
      }),
      create: vi.fn(async ({ data }: any) => {
        const lead = {
          id: `lead-${Date.now()}-${Math.random()}`,
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        leads.push(lead)
        return lead
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const index = leads.findIndex((l) => l.id === where.id)
        if (index === -1) throw { code: 'P2025' }
        leads[index] = { ...leads[index], ...data, updatedAt: new Date() }
        return leads[index]
      }),
      delete: vi.fn(async ({ where }: any) => {
        const index = leads.findIndex((l) => l.id === where.id)
        if (index === -1) throw { code: 'P2025' }
        leads.splice(index, 1)
        return { message: 'deleted' }
      }),
    },
  },
}))

// Import app after mocking
import { app } from '../app.js'

describe('LeadFlow API Endpoints', () => {
  let userToken: string
  let otherUserToken: string

  beforeEach(async () => {
    users = []
    leads = []

    // Seed test users
    const hash = await bcrypt.hash('password123', 10)
    const userA = {
      id: 'user-a',
      name: 'Keshav Sharma',
      email: 'keshav@test.com',
      passwordHash: hash,
      createdAt: new Date(),
    }
    const userB = {
      id: 'user-b',
      name: 'Other User',
      email: 'other@test.com',
      passwordHash: hash,
      createdAt: new Date(),
    }
    users.push(userA, userB)

    userToken = jwt.sign({ userId: userA.id }, JWT_SECRET)
    otherUserToken = jwt.sign({ userId: userB.id }, JWT_SECRET)
  })

  // Test 1: Signup and Login
  it('allows user signup and login with token generation', async () => {
    const signupRes = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'New Sales Rep',
        email: 'sales@test.com',
        password: 'password123',
      })
      .expect(201)

    expect(signupRes.body).toHaveProperty('token')
    expect(signupRes.body.user.email).toBe('sales@test.com')

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'sales@test.com',
        password: 'password123',
      })
      .expect(200)

    expect(loginRes.body).toHaveProperty('token')
  })

  // Test 2: Create valid lead
  it('creates a new lead with valid data', async () => {
    const res = await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Aarav Malhotra',
        email: 'aarav@dental.com',
        phone: '+91 98110 24763',
        company: 'Malhotra Dental',
        source: 'Referral',
        status: 'New',
      })
      .expect(201)

    expect(res.body.name).toBe('Aarav Malhotra')
    expect(res.body.email).toBe('aarav@dental.com')
  })

  // Test 3: Create invalid lead (validation failure)
  it('returns 400 with field errors when creating invalid lead', async () => {
    const res = await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: '',
        email: 'invalid-email',
        phone: '12',
      })
      .expect(400)

    expect(res.body.error).toBe('Validation failed')
    expect(res.body.fields).toHaveProperty('email')
    expect(res.body.fields).toHaveProperty('name')
  })

  // Test 4: List leads with status filter
  it('lists leads filtered by status', async () => {
    // Add two leads: one Qualified, one New
    await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Qualified Lead',
        email: 'qualified@test.com',
        phone: '+91 98110 11111',
        source: 'Website',
        status: 'Qualified',
      })

    await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'New Lead',
        email: 'new@test.com',
        phone: '+91 98110 22222',
        source: 'Website',
        status: 'New',
      })

    const res = await request(app)
      .get('/api/leads?status=Qualified')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200)

    expect(res.body.leads.length).toBe(1)
    expect(res.body.leads[0].name).toBe('Qualified Lead')
  })

  // Test 5: Update lead status
  it('updates lead status correctly', async () => {
    const createRes = await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Lead To Update',
        email: 'update@test.com',
        phone: '+91 98110 33333',
        source: 'Website',
        status: 'New',
      })

    const leadId = createRes.body.id

    const updateRes = await request(app)
      .put(`/api/leads/${leadId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        status: 'Qualified',
      })
      .expect(200)

    expect(updateRes.body.status).toBe('Qualified')
  })

  // Test 6: Delete lead
  it('deletes a lead successfully', async () => {
    const createRes = await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Lead To Delete',
        email: 'delete@test.com',
        phone: '+91 98110 44444',
        source: 'Website',
        status: 'New',
      })

    const leadId = createRes.body.id

    await request(app)
      .delete(`/api/leads/${leadId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200)

    // Verify it cannot be deleted again
    await request(app)
      .delete(`/api/leads/${leadId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(404)
  })

  // Test 7: User isolation (user cannot see another user's lead)
  it("prevents one user from seeing or modifying another user's lead", async () => {
    // User A creates a lead
    const createRes = await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: "User A's Lead",
        email: 'user-a-lead@test.com',
        phone: '+91 98110 55555',
        source: 'Referral',
        status: 'New',
      })

    const userALeadId = createRes.body.id

    // User B lists leads -> should NOT see User A's lead
    const listRes = await request(app)
      .get('/api/leads')
      .set('Authorization', `Bearer ${otherUserToken}`)
      .expect(200)

    const found = listRes.body.leads.find((l: any) => l.id === userALeadId)
    expect(found).toBeUndefined()

    // User B tries to delete User A's lead -> 404
    await request(app)
      .delete(`/api/leads/${userALeadId}`)
      .set('Authorization', `Bearer ${otherUserToken}`)
      .expect(404)
  })
})
