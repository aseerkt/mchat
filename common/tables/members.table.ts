import { bigint, index, pgEnum, pgTable, unique } from 'drizzle-orm/pg-core'
import { baseSchema } from './base'
import { groupsTable } from './groups.table'
import { usersTable } from './users.table'

// order of roles shows auth precedence
export const memberRoleEnum = pgEnum('member_role', [
  'member',
  'admin',
  'owner',
])

export const membersTable = pgTable(
  'members',
  {
    ...baseSchema,
    userId: bigint('user_id', { mode: 'number' })
      .notNull()
      .references(() => usersTable.id),
    groupId: bigint('group_id', { mode: 'number' })
      .notNull()
      .references(() => groupsTable.id, { onDelete: 'cascade' }),
    role: memberRoleEnum('role').notNull().default('member'),
  },
  table => ({
    uniqueUserGroupIndex: unique().on(table.userId, table.groupId),
    userIndex: index().on(table.userId),
    groupIndex: index().on(table.groupId),
  }),
)

export const memberRoles = memberRoleEnum.enumValues

export type Member = typeof membersTable.$inferSelect
export type NewMember = typeof membersTable.$inferInsert
export type MemberRole = Member['role']
