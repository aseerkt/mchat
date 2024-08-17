import { db } from '@/database'
import {
  groupsTable,
  messageRecipientsTable,
  messagesTable,
  usersTable,
} from 'common/tables'
import { and, eq, getTableColumns, isNull } from 'drizzle-orm'
import { checkPermission } from '../members/members.service'

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
  if (groupId) {
    const { isAllowed } = await checkPermission(groupId, senderId, 'member')
    if (!isAllowed) {
      throw new Error('createMessage: Not authorized')
    }
  }

  return db.transaction(async tx => {
    const [message] = await tx
      .insert(messagesTable)
      .values({
        groupId,
        receiverId,
        content,
        senderId,
        parentMessageId,
      })
      .returning()

    let parentMessage

    if (message.parentMessageId) {
      const result = await tx
        .select({
          ...getTableColumns(messagesTable),
          username: usersTable.username,
        })
        .from(messagesTable)
        .where(eq(messagesTable.id, message.parentMessageId))
        .innerJoin(usersTable, eq(usersTable.id, messagesTable.senderId))
        .limit(1)

      parentMessage = result[0]

      if (
        parentMessage.groupId !== groupId &&
        parentMessage.receiverId !== receiverId
      ) {
        throw new Error(
          'createMessage: parent message does not belong to current group or dm',
        )
      }

      if (parentMessage.isDeleted) {
        throw new Error('createMessage: parent message is deleted')
      }
    }

    let chatName = ''

    if (groupId) {
      const [group] = await tx
        .select({ name: groupsTable.name })
        .from(groupsTable)
        .where(eq(groupsTable.id, groupId))
      chatName = group.name
    }

    if (receiverId) {
      const [receiver] = await tx
        .select({ username: usersTable.username })
        .from(usersTable)
        .where(eq(usersTable.id, receiverId))
      chatName = receiver.username
    }

    return { ...message, chatName, parentMessage }
  })
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
  partnerId,
  recipientId,
}: {
  groupId?: number
  partnerId?: number
  recipientId: number
}) => {
  if (!groupId && !partnerId) {
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
        partnerId
          ? and(
              eq(messagesTable.senderId, partnerId),
              eq(messagesTable.receiverId, recipientId),
            )
          : undefined,
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
