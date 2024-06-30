import { TPaginatedParams } from '../../interfaces/common.interface'

export interface IRoom {
  _id: string
  name: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export type TGetUserRoomsQueryVariables = TPaginatedParams & {
  userId: string
}

export interface ICreateRoomArgs {
  name: string
}
