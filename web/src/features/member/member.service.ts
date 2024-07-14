import { IPaginatedResult } from '@/interfaces/common.interface'
import { fetcher, stringifyQueryParams } from '@/utils/api'
import {
  IAddMemberArgs,
  IChangeMemberRoleArgs,
  IGetGroupMembersArgs,
  IKickMemberArgs,
  ILeaveGroupArgs,
  IMember,
  IMemberWithUser,
} from './member.interface'

export const fetchGroupMembers = async ({
  groupId,
  ...params
}: IGetGroupMembersArgs): Promise<IPaginatedResult<IMember, string>> =>
  fetcher(`groups/${groupId}/members?${stringifyQueryParams(params)}`)

export const addGroupMembers = async ({
  groupId,
  memberIds,
}: IAddMemberArgs): Promise<IMember[]> =>
  fetcher(`groups/${groupId}/members`, {
    method: 'POST',
    body: JSON.stringify({ memberIds }),
  })

export const getMember = async (
  groupId: number,
  userId: number,
): Promise<IMemberWithUser> => fetcher(`groups/${groupId}/members/${userId}`)

export const kickMember = ({ groupId, userId }: IKickMemberArgs) =>
  fetcher(`groups/${groupId}/members/${userId}`, { method: 'DELETE' })

export const leaveGroup = ({ groupId, newOwnerId }: ILeaveGroupArgs) => {
  fetcher(`groups/${groupId}/leave`, {
    method: 'DELETE',
    body: newOwnerId ? JSON.stringify({ newOwnerId }) : undefined,
  })
}

export const changeMemberRole = ({
  groupId,
  userId,
  role,
}: IChangeMemberRoleArgs) =>
  fetcher(`groups/${groupId}/members/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  })
