import { RequestHandler } from 'express'
import { verifyToken } from './utils/jwt'

export const auth: RequestHandler = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' })
    }

    const payload = verifyToken(token) as UserPayload

    req.user = payload

    next()
  } catch (error) {
    res.status(401).json({ message: 'Not authenticated' })
  }
}
