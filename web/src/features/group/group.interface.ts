import { TPaginatedParams } from '../../interfaces/common.interface'

export interface IGroup {
  id: number
  name: string
  ownerId: number
  createdAt: string
}

export type TGetUserRoomsQueryVariables = TPaginatedParams & {
  userId: number
}

export interface ICreateRoomArgs {
  name: string
}
