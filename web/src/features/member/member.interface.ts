import { TPaginatedParams } from '@/interfaces/common.interface'

export interface IMember {
  id: number
  groupId: number
  userId: number
  username: string
  role: 'member' | 'admin' | 'owner'
  online?: boolean
}

export interface IMemberWithUser extends Omit<IMember, 'online'> {
  fullName: string
}

export interface IGetGroupMembersArgs extends TPaginatedParams<string> {
  groupId: number
}

export interface IAddMemberArgs {
  groupId: number
  memberIds: number[]
}

export interface IKickMemberArgs {
  groupId: number
  userId: number
}

export interface ILeaveGroupArgs {
  groupId: number
  newOwnerId?: number
}

export interface IChangeMemberRoleArgs extends IKickMemberArgs {
  role: IMember['role']
}
