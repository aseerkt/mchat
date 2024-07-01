import { IPaginatedResult } from '@/interfaces/common.interface'
import { fetcher, stringifyQueryParams } from '@/utils/api'
import { IGetRoomMessagesArgs, IMessage } from './message.interface'

export const fetchRoomMessages = async ({
  groupId,
  ...params
}: IGetRoomMessagesArgs): Promise<IPaginatedResult<IMessage>> =>
  fetcher(`groups/${groupId}/messages?${stringifyQueryParams(params)}`)
