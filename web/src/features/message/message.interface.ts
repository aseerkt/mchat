import {
  IPaginatedResult,
  TPaginatedParams,
} from '@/interfaces/common.interface'
import { InfiniteData } from '@tanstack/react-query'

export interface IMessage {
  _id: string
  roomId: string
  sender: {
    _id: string
    username: string
  }
  text: string
  createdAt: string
  updatedAt: string
}

export interface IGetRoomMessagesArgs extends TPaginatedParams {
  roomId: string
}

export type TMessageInfiniteData = InfiniteData<
  IPaginatedResult<IMessage>,
  string
>
