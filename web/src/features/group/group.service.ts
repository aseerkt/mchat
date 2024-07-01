import {
  IPaginatedResult,
  TPaginatedParams,
} from '@/interfaces/common.interface'
import { fetcher, getAuthHeaders, stringifyQueryParams } from '@/utils/api'
import {
  ICreateRoomArgs,
  IGroup,
  TGetUserRoomsQueryVariables,
} from './group.interface'

export const fetchUserRooms = async ({
  userId,
  ...params
}: TGetUserRoomsQueryVariables): Promise<IPaginatedResult<IGroup>> =>
  fetcher(`users/${userId}/groups?${stringifyQueryParams(params)}`)

export const fetchRoomsToJoin = async (
  params: TPaginatedParams,
): Promise<IPaginatedResult<IGroup>> =>
  fetcher(`groups?${stringifyQueryParams(params)}`)

export const createNewRoom = async (args: ICreateRoomArgs): Promise<IGroup> =>
  fetcher('groups', {
    method: 'POST',
    body: JSON.stringify(args),
  })

export const fetchRoom = async (groupId: number): Promise<IGroup> =>
  fetcher(`groups/${groupId}`, {
    headers: getAuthHeaders(),
  })
