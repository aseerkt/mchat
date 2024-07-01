import { commonSchemaFields } from '@/database/helpers'
import { bigint, pgTable, text } from 'drizzle-orm/pg-core'

export const messages = pgTable('messages', {
  ...commonSchemaFields,
  senderId: bigint('sender_id', { mode: 'number' }).notNull(),
  receiverId: bigint('receiver_id', { mode: 'number' }),
  groupId: bigint('group_id', { mode: 'number' }),
  content: text('content').notNull(),
})

export type Message = typeof messages.$inferSelect
export type NewMessage = typeof messages.$inferInsert
