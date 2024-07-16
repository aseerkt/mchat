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

export interface IGroupWithLastMessage {
  groupId?: number
  receiverId?: number
  name: string
  lastMessage?: {
    messageId: number
    content: string
  }
  unreadCount: number
  lastActivity: string
}

export type IPaginatedInfiniteGroups = InfiniteData<
  IPaginatedResult<IGroupWithLastMessage>
>

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
