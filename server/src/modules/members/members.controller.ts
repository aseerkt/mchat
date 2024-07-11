import { db } from '@/database'
import { getPaginationParams, withPagination } from '@/database/helpers'
import {
  checkOnlineUsers,
  getMultipleUserSockets,
  setGroupMemberRoleTxn,
} from '@/redis/handlers'
import { getGroupRoomId } from '@/socket/helpers'
import { TypedIOServer } from '@/socket/socket.interface'
import { badRequest } from '@/utils/api'
import { and, asc, eq, getTableColumns, gt } from 'drizzle-orm'
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
      io.to(getGroupRoomId(member.groupId)).emit('newMember', {
        ...member,
        username: req.user!.username,
      })
    })

    const currentUserSockets = await getMultipleUserSockets([req.user!.id])

    currentUserSockets.forEach(socketId => {
      const socket = io.sockets.sockets.get(socketId)
      socket?.join(rows.map(member => member.groupId.toString()))
    })

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
        ),
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
