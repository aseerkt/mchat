import { db } from '@/database'
import {
  getMemberRole,
  getMultipleUserSockets,
  setMemberRolesForAGroup,
} from '@/redis/handlers'
import { TypedIOServer } from '@/socket/socket.interface'
import { and, eq } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { Group } from '../groups/groups.schema'
import { MemberRole, NewMember, memberRoles, members } from './members.schema'

export const checkPermission = async (
  groupId: number,
  userId: number,
  role: MemberRole,
) => {
  let memberRole = (await getMemberRole(groupId, userId)) as MemberRole | null

  if (!memberRole) {
    const [member] = await db
      .select({ role: members.role })
      .from(members)
      .where(and(eq(members.groupId, groupId), eq(members.userId, userId)))
      .limit(1)

    if (!member) {
      return { isAllowed: false }
    }

    await setMemberRolesForAGroup(groupId, { [userId]: member.role })
    memberRole = member.role
  }

  return {
    isAllowed: memberRoles.indexOf(memberRole) >= memberRoles.indexOf(role),
    memberRole,
  }
}

export const addMembers = async (
  db: NodePgDatabase,
  io: TypedIOServer,
  group: Group,
  memberIds: number[],
) => {
  const memberValues: NewMember[] = memberIds.map(mid => ({
    groupId: group.id,
    userId: mid,
    role: mid === group.ownerId ? 'owner' : 'member',
  }))

  const newMembers = await db.insert(members).values(memberValues).returning()

  const memberRoles: Record<string, MemberRole> = {}

  newMembers.forEach(member => {
    memberRoles[member.userId] = member.role
  })

  setMemberRolesForAGroup(group.id, memberRoles)

  const userSockets = await joinMultiSocketRooms(io, memberIds, [group.id])

  if (userSockets.length) {
    io.to(userSockets).emit('newGroup', group)
  }

  return newMembers
}

export const joinMultiSocketRooms = async (
  io: TypedIOServer,
  userIds: number[],
  groupIds: number[],
) => {
  const userSockets = await getMultipleUserSockets(userIds)

  for (const socketId of userSockets) {
    const socket = io.sockets.sockets.get(socketId)
    socket?.join(groupIds.map(String))
  }

  return userSockets
}
