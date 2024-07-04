import { db } from '@/database'
import { getMemberRole, setMemberRole } from '@/utils/redis'
import { and, eq } from 'drizzle-orm'
import { MemberRole, memberRoles, members } from './members.schema'

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
      return false
    }

    await setMemberRole(groupId, userId, member.role)
    memberRole = member.role
  }

  return memberRoles.indexOf(memberRole) >= memberRoles.indexOf(role)
}
