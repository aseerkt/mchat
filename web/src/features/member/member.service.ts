import { IPaginatedResult } from '@/interfaces/common.interface'
import { fetcher, stringifyQueryParams } from '@/utils/api'
import {
  IAddMemberArgs,
  IGetGroupMembersArgs,
  IMember,
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
