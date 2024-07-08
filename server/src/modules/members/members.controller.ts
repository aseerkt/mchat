import { db } from '@/database'
import { withPagination } from '@/database/helpers'
import { checkOnlineUsers, setGroupMemberRoleTxn } from '@/redis/handlers'
import { TypedIOServer } from '@/socket/socket.inteface'
import { badRequest } from '@/utils/api'
import { eq, getTableColumns } from 'drizzle-orm'
import { RequestHandler } from 'express'
import { users } from '../users/users.schema'
import { MemberRole, members } from './members.schema'

export const joinRooms: RequestHandler = async (req, res, next) => {
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

    const groupMemberRoles: Record<string, [number, MemberRole]> = {}

    rows.forEach(member => {
      groupMemberRoles[member.groupId] = [member.userId, 'member']
      io.to(member.groupId.toString()).emit('newMember', {
        ...member,
        username: req.user!.username,
      })
    })

    setGroupMemberRoleTxn(groupMemberRoles)

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

    const userIds = result.data.map(member => member.userId)

    const onlineMembers = await checkOnlineUsers(userIds)

    const membersWithOnlineStatus = result.data.map((member, index) => ({
      ...member,
      online: onlineMembers[index] === 1,
    }))

    res.json({ data: membersWithOnlineStatus, cursor: result.cursor })
  } catch (error) {
    next(error)
  }
}

export const getCurrentMember: RequestHandler = (req, res, next) => {
  try {
    return res.json(req.group)
  } catch (error) {
    next(error)
  }
}
