import {
  IPaginatedResult,
  TPaginatedParams,
} from '@/interfaces/common.interface'
import { InfiniteData } from '@tanstack/react-query'

export interface IGroup {
  id: number
  name: string
  ownerId: number
  createdAt: string
}

export interface IChat {
  groupId?: number
  receiverId?: number
  chatName: string
  lastMessage?: {
    messageId: number
    content: string
  }
  unreadCount: number
  lastActivity: string
}

export type IPaginatedInfiniteChats = InfiniteData<IPaginatedResult<IChat>>

export type TGetUserGroupsQueryVariables = TPaginatedParams & {
  userId: number
}

export interface ICreateGroupArgs {
  name: string
  memberIds: number[]
}

export interface IJoinGroupArgs {
  groupIds: number[]
}
