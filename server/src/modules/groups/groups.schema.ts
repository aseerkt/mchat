import { baseSchema } from '@/database/constants'
import { usersTable } from '@/modules/users/users.schema'
import { bigint, pgTable, varchar } from 'drizzle-orm/pg-core'

export const groupsTable = pgTable('groups', {
  ...baseSchema,
  name: varchar('name', { length: 50 }).notNull(),
  ownerId: bigint('owner_id', { mode: 'number' })
    .notNull()
    .references(() => usersTable.id),
})

export type Group = typeof groupsTable.$inferSelect
export type NewGroup = typeof groupsTable.$inferInsert
