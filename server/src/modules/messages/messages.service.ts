import { db } from '@/database'
import { getUserSockets } from '@/redis/handlers'
import { and, eq, isNull } from 'drizzle-orm'
import { groups } from '../groups/groups.schema'
import { checkPermission } from '../members/members.service'
import { messageRecipients, messages } from './messages.schema'

export const insertMessage = async (
  groupId: number,
  content: string,
  senderId: number,
) => {
  const { isAllowed } = await checkPermission(groupId, senderId, 'member')
  if (!isAllowed) {
    throw new Error('createMessage: Not authorized')
  }
  const [group] = await db
    .select({ groupName: groups.name })
    .from(groups)
    .where(eq(groups.id, groupId))
  const [message] = await db
    .insert(messages)
    .values({
      groupId,
      content,
      senderId,
    })
    .returning()
  return { ...message, groupName: group.groupName }
}

export const markMessageAsRead = async (
  messageId: number,
  recipientId: number,
) => {
  const [message] = await db
    .select({ senderId: messages.senderId, groupId: messages.groupId })
    .from(messages)
    .where(eq(messages.id, messageId))
    .limit(1)
  if (!message?.groupId) {
    throw new Error('markMessageAsRead: message does not belongs to a group')
  }

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

  await db.insert(messageRecipients).values({
    messageId,
    recipientId,
  })

  return getUserSockets(message.senderId)
}

export const markGroupMessagesAsRead = async (
  groupId: number,
  recipientId: number,
) => {
  const { isAllowed } = await checkPermission(groupId, recipientId, 'member')

  if (!isAllowed) {
    throw new Error(
      "markGroupMessagesAsRead: you don't have permission to mark the message as read",
    )
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
      and(eq(messages.groupId, groupId), isNull(messageRecipients.messageId)),
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
