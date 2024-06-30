import { IPaginatedResult } from '@/interfaces/common.interface'
import { fetcher, stringifyQueryParams } from '@/utils/api'
import { IGetRoomMembersArgs, IMember } from './member.interface'

export const fetchRoomMembers = async ({
  roomId,
  ...params
}: IGetRoomMembersArgs): Promise<IPaginatedResult<IMember>> =>
  fetcher(`rooms/${roomId}/members?${stringifyQueryParams(params)}`)
