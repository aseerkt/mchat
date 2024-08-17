import { sql } from 'drizzle-orm'
import { pgTable, timestamp, varchar } from 'drizzle-orm/pg-core'
import { baseSchema } from './base'

export const usersTable = pgTable('users', {
  ...baseSchema,
  username: varchar('username', { length: 40 }).unique().notNull(),
  password: varchar('password').notNull(),
  fullName: varchar('full_name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`),
})

export type User = typeof usersTable.$inferSelect
export type NewUser = typeof usersTable.$inferInsert
