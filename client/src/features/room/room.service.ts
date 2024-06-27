import {
  IPaginatedResult,
  TPaginatedParams,
} from '@/interfaces/common.interface'
import { fetcher, getAuthHeaders, stringifyQueryParams } from '@/utils/api'
import {
  ICreateRoomArgs,
  IRoom,
  TGetUserRoomsQueryVariables,
} from './room.interface'

export const fetchUserRooms = async ({
  userId,
  ...params
}: TGetUserRoomsQueryVariables): Promise<IPaginatedResult<IRoom>> =>
  fetcher(`users/${userId}/rooms?${stringifyQueryParams(params)}`)

export const fetchRoomsToJoin = async (
  params: TPaginatedParams,
): Promise<IPaginatedResult<IRoom>> =>
  fetcher(`rooms?${stringifyQueryParams(params)}`)

export const createNewRoom = async (args: ICreateRoomArgs): Promise<IRoom> =>
  fetcher('rooms', {
    method: 'POST',
    body: JSON.stringify(args),
  })

export const fetchRoom = async (roomId: string): Promise<IRoom> =>
  fetcher(`rooms/${roomId}`, {
    headers: getAuthHeaders(),
  })
