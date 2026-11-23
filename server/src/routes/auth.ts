import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma.js'
import { validate } from '../middleware/validate.js'
import { signupSchema, loginSchema } from '../schemas/authSchema.js'
import { requireAuth, AuthRequest } from '../middleware/auth.js'

export const authRouter = Router()

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_change_in_production'

// POST /api/auth/signup
authRouter.post('/signup', validate(signupSchema), async (req: Request, res: Response) => {
  const { name, email, password } = req.body

  const existing = await prisma.user.findUnique({
    where: { email },
  })

  if (existing) {
    return res.status(409).json({
      error: 'An account with this email already exists',
      fields: { email: 'Email is already registered' },
    })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  })

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })

  res.status(201).json({
    token,
    user,
  })
})

// POST /api/auth/login
authRouter.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
  const { email, password } = req.body

  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash)
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
  })
})

// GET /api/auth/me
authRouter.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  })

  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  res.json({ user })
})
