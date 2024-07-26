import { addRefreshToken } from '@/redis/handlers'
import { CookieOptions, Response } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../config'

const refreshTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: config.isProd,
  maxAge: config.refreshTokenMaxAge,
  sameSite: config.isProd ? 'strict' : 'lax',
}

export const decodeToken = (token: string) => jwt.decode(token)

export const signAccessToken = (payload: UserPayload) => {
  return jwt.sign(payload, config.accessTokenSecret, {
    expiresIn: config.accessTokenExpiry,
  })
}

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, config.accessTokenSecret)

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, config.refreshTokenSecret)

export const signTokens = async (res: Response, payload: UserPayload) => {
  const accessToken = signAccessToken(payload)
  const refreshToken = jwt.sign(payload, config.refreshTokenSecret, {
    expiresIn: config.refreshTokenExpiry,
  })

  await addRefreshToken(payload.id, refreshToken)

  res.cookie(config.jwtKey, refreshToken, refreshTokenCookieOptions)

  return accessToken
}

export const clearRefreshTokenCookie = (res: Response) => {
  res.clearCookie(config.jwtKey, refreshTokenCookieOptions)
}
