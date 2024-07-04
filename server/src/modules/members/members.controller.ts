import { db } from '@/database'
import { withPagination } from '@/database/helpers'
import { TypedIOServer } from '@/socket/socket.inteface'
import { badRequest } from '@/utils/api'
import { getOnlineUsers, setMemberRole } from '@/utils/redis'
import { eq, getTableColumns } from 'drizzle-orm'
import { RequestHandler } from 'express'
import { users } from '../users/users.schema'
import { members } from './members.schema'

export const createMembers: RequestHandler = async (req, res, next) => {
  try {
    const { groupIds } = req.body
    if (!groupIds?.length) {
      return badRequest(res, 'No group ids provided')
    }

    const rows = await db
      .insert(members)
      .values(
        (groupIds as number[]).map(groupId => ({
          groupId: Number(groupId),
          userId: req.user!.id,
        })),
      )
      .returning()

    const io: TypedIOServer = req.app.get('io')

    rows.forEach(member => {
      setMemberRole(member.groupId, req.user!.id, 'member')
      // TODO: do not emit events to current socket
      io.to(member.groupId.toString()).emit('newMember', {
        ...member,
        username: req.user!.username,
      })
    })

    res.status(201).json(rows)
  } catch (error) {
    next(error)
  }
}

export const getGroupMembers: RequestHandler = async (req, res, next) => {
  try {
    const result = await withPagination(
      db
        .select({ ...getTableColumns(members), username: users.username })
        .from(members)
        .innerJoin(users, eq(members.userId, users.id))
        .$dynamic(),
      {
        query: req.query,
        where: eq(members.groupId, Number(req.params.groupId)),
        sortByColumn: users.username,
        sortDirection: 'asc',
      },
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
