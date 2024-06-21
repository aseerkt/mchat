import jwt from 'jsonwebtoken'
import { config } from '../config'

export const signToken = (payload: UserPayload) =>
  jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' })

export const verifyToken = (token: string) =>
  jwt.verify(token, config.jwtSecret)
