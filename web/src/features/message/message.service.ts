import { IPaginatedResult } from '@/interfaces/common.interface'
import { fetcher, stringifyQueryParams } from '@/utils/api'
import { IGetChatMessagesArgs, IMessage } from './message.interface'

export const fetchMessages = async ({
  ...params
}: IGetChatMessagesArgs): Promise<IPaginatedResult<IMessage>> =>
  fetcher(`messages?${stringifyQueryParams(params)}`)
