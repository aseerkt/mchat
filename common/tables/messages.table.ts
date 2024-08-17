import {
  AnyPgColumn,
  bigint,
  boolean,
  index,
  pgTable,
  text,
} from 'drizzle-orm/pg-core'
import { baseSchema } from './base'
import { groupsTable } from './groups.table'
import { usersTable } from './users.table'

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
    parentMessageId: bigint('parent_message_id', { mode: 'number' }).references(
      (): AnyPgColumn => messagesTable.id,
    ),
    isDeleted: boolean('is_deleted').default(false),
  },
  table => ({
    groupIdIndex: index().on(table.groupId),
    createdAtIndex: index().on(table.createdAt),
  }),
)

export type Message = typeof messagesTable.$inferSelect
export type NewMessage = typeof messagesTable.$inferInsert
