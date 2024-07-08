import { ErrorRequestHandler, RequestHandler } from 'express'
import { config } from './config'
import { MemberRole } from './modules/members/members.schema'
import { checkPermission } from './modules/members/members.service'
import { notAuthenticated, notAuthorized } from './utils/api'
import { verifyToken } from './utils/jwt'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({
    message: 'Something went wrong',
    error: config.isProd ? undefined : err.message,
  })
}

export const auth: RequestHandler = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return notAuthenticated(res)
    }

    const payload = verifyToken(token) as UserPayload

    req.user = payload

    next()
  } catch (error) {
    notAuthenticated(res)
  }
}

export const hasGroupPermission =
  (role: MemberRole): RequestHandler =>
  async (req, res, next) => {
    try {
      const groupId = Number(
        req.params.groupId || req.query.groupId || req.body.groupId,
      )

      if (Number.isNaN(groupId)) {
        return notAuthorized(res)
      }

      const { isAllowed, memberRole } = await checkPermission(
        groupId,
        req.user!.id,
        role,
      )

      if (!isAllowed) {
        return notAuthorized(res)
      }

      req.group = {
        id: groupId,
        role: memberRole!,
      }

      next()
    } catch (error) {
      notAuthorized(res)
    }
  }
