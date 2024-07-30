import {
  IPaginatedResult,
  TPaginatedParams,
} from '@/interfaces/common.interface'
import { InfiniteData } from '@tanstack/react-query'

export interface IMessage {
  id: number
  groupId?: number
  receiverId?: number
  senderId: number
  username: string
  content: string
  createdAt: string
  isDeleted: boolean
  parentMessageId?: number
  parentMessage?: Pick<IMessage, 'id' | 'content' | 'username' | 'isDeleted'>
}

export interface IGetChatMessagesArgs extends TPaginatedParams {
  groupId?: number
  partnerId?: number
}

export type TMessageInfiniteData = InfiniteData<
  IPaginatedResult<IMessage>,
  string
>

export interface IMessageRecipient {
  messageId: number
  userId: number
  username: string
  fullName: string
  readAt: string
}
