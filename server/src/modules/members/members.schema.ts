import { baseSchema } from '@/database/constants'
import { bigint, index, pgEnum, pgTable, unique } from 'drizzle-orm/pg-core'
import { groups } from '../groups/groups.schema'
import { users } from '../users/users.schema'

// order of roles shows auth precedence
export const memberRoleEnum = pgEnum('member_role', [
  'member',
  'admin',
  'owner',
])

export const members = pgTable(
  'members',
  {
    ...baseSchema,
    userId: bigint('user_id', { mode: 'number' })
      .notNull()
      .references(() => users.id),
    groupId: bigint('group_id', { mode: 'number' })
      .notNull()
      .references(() => groups.id, { onDelete: 'cascade' }),
    role: memberRoleEnum('role').notNull().default('member'),
  },
  table => ({
    uniqueUserGroupIndex: unique().on(table.userId, table.groupId),
    userIndex: index().on(table.userId),
    groupIndex: index().on(table.groupId),
  }),
)

export const memberRoles = memberRoleEnum.enumValues

export type Member = typeof members.$inferSelect
export type NewMember = typeof members.$inferInsert
export type MemberRole = Member['role']
