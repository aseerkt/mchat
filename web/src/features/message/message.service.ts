import { IPaginatedResult } from '@/interfaces/common.interface'
import { fetcher, stringifyQueryParams } from '@/utils/api'
import {
  IGetChatMessagesArgs,
  IMessage,
  IMessageRecipient,
} from './message.interface'

export const fetchMessages = async ({
  ...params
}: IGetChatMessagesArgs): Promise<IPaginatedResult<IMessage>> =>
  fetcher(`messages?${stringifyQueryParams(params)}`)

export const fetchMessageRecipients = async (
  messageId: number,
): Promise<IMessageRecipient[]> => fetcher(`messages/${messageId}/recipients`)

export const deleteMessage = async (messageId: number) =>
  fetcher(`messages/${messageId}`, { method: 'DELETE' })
