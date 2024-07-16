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
}

export interface IGetChatMessagesArgs extends TPaginatedParams {
  groupId?: number
  receiverId?: number
}

export type TMessageInfiniteData = InfiniteData<
  IPaginatedResult<IMessage>,
  string
>
