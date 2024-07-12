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

export interface IGroupWithLastMessage
  extends Omit<IGroup, 'createdAt' | 'ownerId'> {
  lastMessage?: {
    id: number
    content: string
    senderId: number
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
