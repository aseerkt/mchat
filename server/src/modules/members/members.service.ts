import { db } from '@/database'
import { getMemberRole, setMemberRolesForAGroup } from '@/redis/handlers'
import { roomKeys } from '@/socket/helpers'
import { TypedIOServer } from 'common/socket'
import {
  Group,
  MemberRole,
  NewMember,
  memberRoles,
  membersTable,
} from 'common/tables'
import { and, eq } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

export const checkPermission = async (
  groupId: number,
  userId: number,
  role: MemberRole,
) => {
  let memberRole = (await getMemberRole(groupId, userId)) as MemberRole | null

  if (!memberRole) {
    const [member] = await db
      .select({ role: membersTable.role })
      .from(membersTable)
      .where(
        and(eq(membersTable.groupId, groupId), eq(membersTable.userId, userId)),
      )
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

  const newMembers = await db
    .insert(membersTable)
    .values(memberValues)
    .returning()

  const memberRoles: Record<string, MemberRole> = {}

  newMembers.forEach(member => {
    memberRoles[member.userId] = member.role
  })

  setMemberRolesForAGroup(group.id, memberRoles)

  for (const memberId of memberIds) {
    // new member to join group room
    io.in(roomKeys.USER_KEY(memberId)).socketsJoin(roomKeys.GROUP_KEY(group.id))
    // emit newGroup event to new member sockets
    io.to(roomKeys.USER_KEY(memberId)).emit('newGroup', group)
  }

  return newMembers
}
