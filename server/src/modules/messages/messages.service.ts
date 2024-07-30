import { db } from '@/database'
import { and, eq, isNull } from 'drizzle-orm'
import { groupsTable } from '../groups/groups.schema'
import { checkPermission } from '../members/members.service'
import { usersTable } from '../users/users.schema'
import { messageRecipientsTable, messagesTable } from './messages.schema'

export const insertMessage = async ({
  groupId,
  receiverId,
  content,
  senderId,
  parentMessageId,
}: {
  groupId?: number
  receiverId?: number
  content: string
  senderId: number
  parentMessageId?: number
}) => {
  let chatName = ''
  if (groupId) {
    const { isAllowed } = await checkPermission(groupId, senderId, 'member')
    if (!isAllowed) {
      throw new Error('createMessage: Not authorized')
    }
    const [group] = await db
      .select({ name: groupsTable.name })
      .from(groupsTable)
      .where(eq(groupsTable.id, groupId))
    chatName = group.name
  }

  if (receiverId) {
    const [receiver] = await db
      .select({ username: usersTable.username })
      .from(usersTable)
      .where(eq(usersTable.id, receiverId))
    chatName = receiver.username
  }

  const [message] = await db
    .insert(messagesTable)
    .values({
      groupId,
      receiverId,
      content,
      senderId,
      parentMessageId,
    })
    .returning()
  return { ...message, chatName }
}

export const markMessageAsRead = async (
  messageId: number,
  recipientId: number,
) => {
  const [message] = await db
    .select({
      senderId: messagesTable.senderId,
      receiverId: messagesTable.receiverId,
      groupId: messagesTable.groupId,
    })
    .from(messagesTable)
    .where(eq(messagesTable.id, messageId))
    .limit(1)
  if (!message.groupId && !message.receiverId) {
    throw new Error(
      'markMessageAsRead: message does not belongs to either group or dm',
    )
  }

  if (message.groupId) {
    const { isAllowed } = await checkPermission(
      message.groupId,
      recipientId,
      'member',
    )

    if (!isAllowed) {
      throw new Error(
        "markMessageAsRead: you don't have permission to mark the message as read",
      )
    }
  }

  await db
    .insert(messageRecipientsTable)
    .values({
      messageId,
      recipientId,
    })
    .onConflictDoNothing()

  return message.senderId
}

export const markChatMessagesAsRead = async ({
  groupId,
  receiverId,
  recipientId,
}: {
  groupId?: number
  receiverId?: number
  recipientId: number
}) => {
  if (!groupId && !receiverId) {
    throw new Error(
      'markChatMessagesAsRead: message does not belongs to either group or dm',
    )
  }
  if (groupId) {
    const { isAllowed } = await checkPermission(groupId, recipientId, 'member')

    if (!isAllowed) {
      throw new Error(
        "markGroupMessagesAsRead: you don't have permission to mark the message as read",
      )
    }
  }

  const unreadMessages = await db
    .select({ messageId: messagesTable.id, senderId: messagesTable.senderId })
    .from(messagesTable)
    .leftJoin(
      messageRecipientsTable,
      and(
        eq(messageRecipientsTable.messageId, messagesTable.id),
        eq(messageRecipientsTable.recipientId, recipientId),
      ),
    )
    .where(
      and(
        groupId ? eq(messagesTable.groupId, groupId) : undefined,
        receiverId ? eq(messagesTable.receiverId, receiverId) : undefined,
        isNull(messageRecipientsTable.messageId),
      ),
    )

  if (unreadMessages.length) {
    await db.insert(messageRecipientsTable).values(
      unreadMessages.map(message => ({
        messageId: message.messageId,
        recipientId,
      })),
    )
  }
  return unreadMessages
}

export const checkMessageOwnerShip = async (
  messageId: number,
  userId: number,
) => {
  const [message] = await db
    .select({
      senderId: messagesTable.senderId,
      receiverId: messagesTable.receiverId,
      groupId: messagesTable.groupId,
    })
    .from(messagesTable)
    .where(eq(messagesTable.id, messageId))
    .limit(1)

  return { isOwner: message?.senderId === userId, message }
}
