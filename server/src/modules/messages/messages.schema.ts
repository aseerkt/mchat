import { baseSchema } from '@/database/constants'
import { bigint, index, pgTable, text, unique } from 'drizzle-orm/pg-core'
import { groupsTable } from '../groups/groups.schema'
import { usersTable } from '../users/users.schema'

export const messagesTable = pgTable(
  'messages',
  {
    ...baseSchema,
    senderId: bigint('sender_id', { mode: 'number' })
      .references(() => usersTable.id)
      .notNull(),
    receiverId: bigint('receiver_id', { mode: 'number' }).references(
      () => usersTable.id,
    ),
    groupId: bigint('group_id', { mode: 'number' }).references(
      () => groupsTable.id,
      { onDelete: 'cascade' },
    ),
    content: text('content').notNull(),
  },
  table => ({
    groupIdIndex: index().on(table.groupId),
    createdAtIndex: index().on(table.createdAt),
  }),
)

export const messageRecipientsTable = pgTable(
  'message_recipients',
  {
    ...baseSchema,
    messageId: bigint('message_id', { mode: 'number' })
      .references(() => messagesTable.id, { onDelete: 'cascade' })
      .notNull(),
    recipientId: bigint('recipient_id', { mode: 'number' })
      .references(() => usersTable.id)
      .notNull(),
  },
  table => ({
    uniqueMessageRecipientIndex: unique().on(
      table.messageId,
      table.recipientId,
    ),
  }),
)

export type Message = typeof messagesTable.$inferSelect
export type NewMessage = typeof messagesTable.$inferInsert
