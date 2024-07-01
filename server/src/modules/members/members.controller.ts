import { db } from '@/database'
import { withPagination } from '@/database/helpers'
import { badRequest } from '@/utils/api'
import { getOnlineUsers, setMemberRole } from '@/utils/redis'
import { eq, getTableColumns } from 'drizzle-orm'
import { RequestHandler } from 'express'
import { users } from '../users/users.schema'
import { members } from './members.schema'

export const createMembers: RequestHandler = async (req, res, next) => {
  try {
    const { groupIds: groupIds } = req.body
    if (!groupIds?.length) {
      return badRequest(res, 'No group id provided')
    }

    const rows = await db
      .insert(members)
      .values(
        (groupIds as string[]).map(groupId => ({
          groupId: Number(groupId),
          userId: req.user!.id,
        })),
      )
      .returning()

    rows.forEach(({ groupId }) => {
      setMemberRole(groupId, req.user!.id, 'member')
    })

    res.status(201).json(members)
  } catch (error) {
    next(error)
  }
}

export const getRoomMembers: RequestHandler = async (req, res, next) => {
  try {
    const result = await withPagination(
      db
        .select({ ...getTableColumns(members), username: users.username })
        .from(members)
        .innerJoin(users, eq(members.userId, users.id))
        .$dynamic(),
      req.query,
      members.id,
      'asc',
      eq(members.groupId, Number(req.params.groupId)),
    )

    if (!result?.data.length) {
      return res.json({ data: [] })
    }

    // TODO: avoid fetching all online users
    const onlineMembers = await getOnlineUsers()

    const membersWithOnlineStatus = result.data.map(member => ({
      ...member,
      online: onlineMembers.has(String(member.userId)),
    }))

    res.json({ data: membersWithOnlineStatus, cursor: result.cursor })
  } catch (error) {
    next(error)
  }
}
