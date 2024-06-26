import { commonSchemaFields } from '@/database/helpers'
import { users } from '@/modules/users/users.schema'
import { bigint, pgTable, varchar } from 'drizzle-orm/pg-core'

export const groups = pgTable('groups', {
  ...commonSchemaFields,
  name: varchar('name', { length: 50 }).notNull(),
  ownerId: bigint('owner_id', { mode: 'number' })
    .notNull()
    .references(() => users.id),
})

export type Group = typeof groups.$inferSelect
export type NewGroup = typeof groups.$inferInsert
