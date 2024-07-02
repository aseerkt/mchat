import { IPaginatedResult } from '@/interfaces/common.interface'
import { fetcher, stringifyQueryParams } from '@/utils/api'
import { IGetGroupMessagesArgs, IMessage } from './message.interface'

export const fetchGroupMessages = async ({
  groupId,
  ...params
}: IGetGroupMessagesArgs): Promise<IPaginatedResult<IMessage>> =>
  fetcher(`groups/${groupId}/messages?${stringifyQueryParams(params)}`)
