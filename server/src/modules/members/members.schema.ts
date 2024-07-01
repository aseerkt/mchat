import { commonSchemaFields } from '@/database/helpers'
import { bigint, index, pgEnum, pgTable, unique } from 'drizzle-orm/pg-core'

export const memberRoleEnum = pgEnum('member_role', [
  'owner',
  'admin',
  'member',
])

export const members = pgTable(
  'members',
  {
    ...commonSchemaFields,
    userId: bigint('user_id', { mode: 'number' }).notNull(),
    groupId: bigint('group_id', { mode: 'number' }).notNull(),
    role: memberRoleEnum('role').notNull().default('member'),
  },
  table => ({
    pk: unique().on(table.userId, table.groupId),
    memberUserIndex: index().on(table.userId),
    memberGroupIndex: index().on(table.groupId),
  }),
)

export type Member = typeof members.$inferSelect
export type NewMember = typeof members.$inferInsert
export type MemberRole = Member['role']
