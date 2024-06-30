import { TPaginatedParams } from '@/interfaces/common.interface'

export interface IMember {
  _id: string
  roomId: string
  user: {
    _id: string
    username: string
  }
  role: 'member' | 'admin' | 'owner'
  online?: boolean
}

export interface IGetRoomMembersArgs extends TPaginatedParams {
  roomId: string
}
