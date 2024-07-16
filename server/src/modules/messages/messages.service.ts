import { db } from '@/database'
import { getUserSockets } from '@/redis/handlers'
import { and, eq, isNull } from 'drizzle-orm'
import { groups } from '../groups/groups.schema'
import { checkPermission } from '../members/members.service'
import { users } from '../users/users.schema'
import { messageRecipients, messages } from './messages.schema'

export const insertMessage = async ({
  groupId,
  receiverId,
  content,
  senderId,
}: {
  groupId?: number
  receiverId?: number
  content: string
  senderId: number
}) => {
  let chatName = ''
  if (groupId) {
    const { isAllowed } = await checkPermission(groupId, senderId, 'member')
    if (!isAllowed) {
      throw new Error('createMessage: Not authorized')
    }
    const [group] = await db
      .select({ name: groups.name })
      .from(groups)
      .where(eq(groups.id, groupId))
    chatName = group.name
  }

  if (receiverId) {
    const [receiver] = await db
      .select({ username: users.username })
      .from(users)
      .where(eq(users.id, receiverId))
    chatName = receiver.username
  }

  const [message] = await db
    .insert(messages)
    .values({
      groupId,
      receiverId,
      content,
      senderId,
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
      senderId: messages.senderId,
      receiverId: messages.receiverId,
      groupId: messages.groupId,
    })
    .from(messages)
    .where(eq(messages.id, messageId))
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

  await db.insert(messageRecipients).values({
    messageId,
    recipientId,
  })

  return getUserSockets(message.senderId)
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
    .select({ messageId: messages.id, senderId: messages.senderId })
    .from(messages)
    .leftJoin(
      messageRecipients,
      and(
        eq(messageRecipients.messageId, messages.id),
        eq(messageRecipients.recipientId, recipientId),
      ),
    )
    .where(
      and(
        groupId ? eq(messages.groupId, groupId) : undefined,
        receiverId ? eq(messages.receiverId, receiverId) : undefined,
        isNull(messageRecipients.messageId),
      ),
    )

  if (unreadMessages.length) {
    await db.insert(messageRecipients).values(
      unreadMessages.map(message => ({
        messageId: message.messageId,
        recipientId,
      })),
    )

    return getUserSockets(recipientId)
  }
}
