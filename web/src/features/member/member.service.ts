import { IPaginatedResult } from '@/interfaces/common.interface'
import { fetcher, stringifyQueryParams } from '@/utils/api'
import { IGetGroupMembersArgs, IMember } from './member.interface'

export const fetchGroupMembers = async ({
  groupId,
  ...params
}: IGetGroupMembersArgs): Promise<IPaginatedResult<IMember, string>> =>
  fetcher(`groups/${groupId}/members?${stringifyQueryParams(params)}`)
