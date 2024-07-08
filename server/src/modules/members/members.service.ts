import { db } from '@/database'
import {
  getMemberRole,
  getUserSockets,
  setMemberRolesForAGroup,
} from '@/redis/handlers'
import { TypedIOServer } from '@/socket/socket.inteface'
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

  const userIds: number[] = []
  const memberRoles: Record<string, MemberRole> = {}

  newMembers.forEach(member => {
    if (member.userId !== group.ownerId) {
      userIds.push(member.userId)
    }
    memberRoles[member.userId] = member.role
  })

  setMemberRolesForAGroup(group.id, memberRoles)

  const userSockets = await getUserSockets(userIds)

  io.to(userSockets).emit('newGroup', group)

  return newMembers
}
