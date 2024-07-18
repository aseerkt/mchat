import { db } from '@/database'
import { getPaginationParams, withPagination } from '@/database/helpers'
import { checkOnlineUsers, setGroupMemberRoleTxn } from '@/redis/handlers'
import { roomKeys } from '@/socket/helpers'
import { TypedIOServer } from '@/socket/socket.interface'
import { badRequest, notFound } from '@/utils/api'
import { and, asc, eq, getTableColumns, gt, like } from 'drizzle-orm'
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
      io.to(roomKeys.CURRENT_GROUP_KEY(member.groupId)).emit('newMember', {
        ...member,
        username: req.user!.username,
      })
    })

    // get sockets for current user id

    const currentUserSockets = await io
      .in(roomKeys.USER_KEY(req.user!.id))
      .fetchSockets()

    // join group rooms

    for (const socket of currentUserSockets) {
      socket?.join(rows.map(member => roomKeys.GROUP_KEY(member.groupId)))
    }

    setGroupMemberRoleTxn(groupMemberRoles)

    res.status(201).json(rows)
  } catch (error) {
    next(error)
  }
}

export const getGroupMembers: RequestHandler = async (req, res, next) => {
  try {
    const { cursor, limit } = getPaginationParams(req.query)
    const result = await withPagination(
      db
        .select({ ...getTableColumns(members), username: users.username })
        .from(members)
        .innerJoin(users, eq(members.userId, users.id))
        .$dynamic(),

      {
        limit,
        cursorSelect: 'username',
        orderBy: [asc(users.username)],
        where: and(
          eq(members.groupId, Number(req.params.groupId)),
          cursor ? gt(users.username, cursor as string) : undefined,
          req.query.query
            ? like(users.username, `%${req.query.query}%`)
            : undefined,
        ),
      },
    )

    if (!result?.data.length) {
      return res.json({ data: [] })
    }

    const userIds = result.data.map(member => member.userId)

    const onlineMembers = await checkOnlineUsers(userIds)
    console.log('online_members', onlineMembers)

    const membersWithOnlineStatus = result.data.map((member, index) => ({
      ...member,
      online: onlineMembers[index] == 1,
    }))

    res.json({ data: membersWithOnlineStatus, cursor: result.cursor })
  } catch (error) {
    next(error)
  }
}

export const getGroupMember: RequestHandler = async (req, res, next) => {
  try {
    const [member] = await db
      .select({
        ...getTableColumns(members),
        fullName: users.fullName,
        username: users.username,
      })
      .from(members)
      .where(
        and(
          eq(members.userId, Number(req.params.userId)),
          eq(members.groupId, Number(req.params.groupId)),
        ),
      )
      .innerJoin(users, eq(members.userId, users.id))

    if (!member) {
      return notFound(res, 'Member')
    }
    res.json(member)
  } catch (error) {
    next(error)
  }
}
