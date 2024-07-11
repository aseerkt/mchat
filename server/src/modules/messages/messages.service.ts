import { db } from '@/database'
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
  const [message] = await db
    .insert(messages)
    .values({
      groupId,
      content,
      senderId,
    })
    .returning()
  return message
}

export const markMessageAsRead = async (
  messageId: number,
  recipientId: number,
) => {
  await db.insert(messageRecipients).values({
    messageId,
    recipientId,
  })
}
