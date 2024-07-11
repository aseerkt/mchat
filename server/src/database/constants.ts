import { sql } from 'drizzle-orm'
import { bigserial, timestamp } from 'drizzle-orm/pg-core'

export const baseSchema = {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => sql`now()`),
}

export const defaultLimit = 15
