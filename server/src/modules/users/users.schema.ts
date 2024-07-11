import { baseSchema } from '@/database/constants'
import { sql } from 'drizzle-orm'
import { pgTable, timestamp, varchar } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  ...baseSchema,
  username: varchar('username', { length: 40 }).unique().notNull(),
  password: varchar('password').notNull(),
  fullName: varchar('full_name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
