import { IPaginatedResult } from '@/interfaces/common.interface'
import { fetcher, stringifyQueryParams } from '@/utils/api'
import { IGetRoomMessagesArgs, IMessage } from './message.interface'

export const fetchRoomMessages = async ({
  roomId,
  ...params
}: IGetRoomMessagesArgs): Promise<IPaginatedResult<IMessage>> =>
  fetcher(`rooms/${roomId}/messages?${stringifyQueryParams(params)}`)
