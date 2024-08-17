import { bigint, pgTable, unique } from 'drizzle-orm/pg-core'
import { baseSchema } from './base'
import { messagesTable } from './messages.table'
import { usersTable } from './users.table'

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
