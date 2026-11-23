import { Request, Response, NextFunction } from 'express'

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'A lead with this email already exists',
      fields: { email: 'Email already exists in your leads' },
    })
  }

  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Lead not found' })
  }

  const status = err.status || err.statusCode || 500
  const message = err.message || 'Internal server error'
  res.status(status).json({ error: message })
}
