import { TPaginatedParams } from '@/interfaces/common.interface'

export interface IMember {
  id: number
  groupId: number
  userId: number
  username: string
  role: 'member' | 'admin' | 'owner'
  online?: boolean
}

export interface IGetGroupMembersArgs extends TPaginatedParams<string> {
  groupId: number
}
