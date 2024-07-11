import { baseSchema } from '@/database/constants'
import { bigint, pgTable, text, unique } from 'drizzle-orm/pg-core'
import { groups } from '../groups/groups.schema'
import { users } from '../users/users.schema'

export const messages = pgTable('messages', {
  ...baseSchema,
  senderId: bigint('sender_id', { mode: 'number' })
    .references(() => users.id)
    .notNull(),
  receiverId: bigint('receiver_id', { mode: 'number' }).references(
    () => users.id,
  ),
  groupId: bigint('group_id', { mode: 'number' }).references(() => groups.id),
  content: text('content').notNull(),
})

export const messageRecipients = pgTable(
  'message_recipients',
  {
    ...baseSchema,
    messageId: bigint('message_id', { mode: 'number' })
      .references(() => messages.id)
      .notNull(),
    recipientId: bigint('recipient_id', { mode: 'number' })
      .references(() => users.id)
      .notNull(),
  },
  table => ({
    uniqueMessageRecipient: unique().on(table.messageId, table.recipientId),
  }),
)

export type Message = typeof messages.$inferSelect
export type NewMessage = typeof messages.$inferInsert
