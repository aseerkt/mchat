import { MemberRole } from 'common/tables'
import { ErrorRequestHandler, RequestHandler } from 'express'
import { config } from './config'
import { checkPermission } from './modules/members/members.service'
import { badRequest, notAuthenticated, notAuthorized } from './utils/api'
import { verifyAccessToken } from './utils/jwt'

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

    const payload = verifyAccessToken(token) as UserPayload

    req.user = payload

    next()
  } catch (error) {
    notAuthenticated(res)
  }
}

export const hasChatPermission =
  (role: MemberRole): RequestHandler =>
  async (req, res, next) => {
    try {
      const groupId = Number(
        req.params.groupId || req.query.groupId || req.body.groupId,
      )

      const partnerId = Number(
        req.params.partnerId || req.query.partnerId || req.body.partnerId,
      )

      if (!groupId && !partnerId) {
        return badRequest(res)
      }

      if (groupId) {
        const { isAllowed, memberRole } = await checkPermission(
          groupId,
          req.user!.id,
          role,
        )

        if (!isAllowed) {
          return notAuthorized(res)
        }

        req.member = {
          groupId: groupId,
          role: memberRole!,
        }
      }

      next()
    } catch (error) {
      notAuthorized(res)
    }
  }
