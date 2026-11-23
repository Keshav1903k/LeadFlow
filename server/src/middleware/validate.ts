import { Request, Response, NextFunction } from 'express'
import { AnyZodObject, ZodError } from 'zod'

export function validate(schema: AnyZodObject) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body)
      next()
    } catch (err) {
      if (err instanceof ZodError) {
        const fields: Record<string, string> = {}
        for (const issue of err.issues) {
          const field = issue.path.join('.')
          if (!fields[field]) {
            fields[field] = issue.message
          }
        }
        return res.status(400).json({
          error: 'Validation failed',
          fields,
        })
      }
      next(err)
    }
  }
}
