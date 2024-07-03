import { TPaginatedParams } from '@/interfaces/common.interface'

export interface IGroup {
  id: number
  name: string
  ownerId: number
  createdAt: string
}

export type TGetUserGroupsQueryVariables = TPaginatedParams & {
  userId: number
}

export interface ICreateGroupArgs {
  name: string
}
