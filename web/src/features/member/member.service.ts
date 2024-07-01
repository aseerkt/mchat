import { IPaginatedResult } from '@/interfaces/common.interface'
import { fetcher, stringifyQueryParams } from '@/utils/api'
import { IGetRoomMembersArgs, IMember } from './member.interface'

export const fetchRoomMembers = async ({
  groupId,
  ...params
}: IGetRoomMembersArgs): Promise<IPaginatedResult<IMember>> =>
  fetcher(`groups/${groupId}/members?${stringifyQueryParams(params)}`)
