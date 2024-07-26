import { config } from '@/config'
import { db } from '@/database'
import { getRedisClient } from '@/redis'
import { invalidateRefreshToken, isRefreshTokenValid } from '@/redis/handlers'
import { notAuthorized } from '@/utils/api'
import {
  clearRefreshTokenCookie,
  signTokens,
  verifyRefreshToken,
} from '@/utils/jwt'
import { sql } from 'drizzle-orm'
import { RequestHandler } from 'express'

export const welcome: RequestHandler = (_, res) => {
  res.send(`<h1>Welcome to ${config.appName} API</h1>`)
}

export const healthCheck: RequestHandler = async (_req, res, next) => {
  try {
    await db.execute(sql`SELECT 1`)
    const redisClient = getRedisClient()
    const redisResult = await redisClient.ping()

    res.json({ postgres: 'Ok', redis: redisResult })
  } catch (error) {
    next(error)
  }
}

export const recreateAccessToken: RequestHandler = async (req, res) => {
  const refreshToken = req.cookies[config.jwtKey]

  if (!refreshToken) {
    return notAuthorized(res)
  }

  try {
    const refreshPayload = verifyRefreshToken(refreshToken) as UserPayload & {
      tokenId: string
    }

    const isValid = await isRefreshTokenValid(
      refreshPayload.id,
      refreshToken.tokenId,
      refreshToken,
    )

    if (!isValid) {
      return notAuthorized(res)
    }

    const payload: UserPayload = {
      id: refreshPayload.id,
      fullName: refreshPayload.fullName,
      username: refreshPayload.username,
    }

    // invalidate the old refresh token
    await invalidateRefreshToken(refreshPayload.id, refreshToken)
    // sign new tokens (access, refresh)
    const token = await signTokens(res, payload)
    res.json({ token, user: payload })
  } catch (error) {
    return notAuthorized(res)
  }
}

export const logout: RequestHandler = async (req, res, next) => {
  try {
    const refreshPayload = verifyRefreshToken(
      req.cookies[config.jwtKey],
    ) as UserPayload & {
      tokenId: string
    }
    await invalidateRefreshToken(req.user!.id, refreshPayload.tokenId)
    clearRefreshTokenCookie(res)
  } catch (error) {
    next(error)
  }
}
