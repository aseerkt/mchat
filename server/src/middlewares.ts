import { and, eq } from 'drizzle-orm'
import { RequestHandler } from 'express'
import { db } from './database'
import { MemberRole, members } from './modules/members/members.schema'
import { notAuthenticated, notAuthorized } from './utils/api'
import { verifyToken } from './utils/jwt'
import { getMemberRole, setMemberRole } from './utils/redis'

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

const memberRoles: MemberRole[] = ['member', 'admin', 'owner']

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

      let memberRole = (await getMemberRole(
        groupId,
        req.user!.id,
      )) as MemberRole | null

      if (!memberRole) {
        const [member] = await db
          .select()
          .from(members)
          .where(
            and(eq(members.groupId, groupId), eq(members.userId, req.user!.id)),
          )
          .limit(1)

        if (!member) {
          return notAuthorized(res)
        }

        await setMemberRole(groupId, req.user!.id, member.role)
        memberRole = member.role
      }

      if (memberRoles.indexOf(memberRole!) < memberRoles.indexOf(role)) {
        return notAuthorized(res)
      }

      next()
    } catch (error) {
      notAuthorized(res)
    }
  }
