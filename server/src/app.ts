import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { authRouter } from './routes/auth.js'
import { leadsRouter } from './routes/leads.js'
import { errorHandler } from './middleware/errorHandler.js'

dotenv.config()

export const app = express()

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
app.use(express.json())

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'LeadFlow API' })
})

// Authentication
app.use('/api/auth', authRouter)

// Leads CRUD & stats
app.use('/api/leads', leadsRouter)

// Central error handler
app.use(errorHandler)
