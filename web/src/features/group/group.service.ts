import {
  IPaginatedResult,
  TPaginatedParams,
} from '@/interfaces/common.interface'
import { fetcher, stringifyQueryParams } from '@/utils/api'
import { IMember } from '../member/member.interface'
import {
  IChat,
  ICreateGroupArgs,
  IGroup,
  IJoinGroupArgs,
  TGetUserGroupsQueryVariables,
} from './group.interface'

export const fetchUserChats = async ({
  userId,
  ...params
}: TGetUserGroupsQueryVariables): Promise<IPaginatedResult<IChat>> =>
  fetcher(`users/${userId}/groups?${stringifyQueryParams(params)}`)

export const fetchGroupsToJoin = async (
  params: TPaginatedParams,
): Promise<IPaginatedResult<IGroup>> =>
  fetcher(`groups?${stringifyQueryParams(params)}`)

export const fetchGroup = async (groupId: number): Promise<IGroup> =>
  fetcher(`groups/${groupId}`, {})

export const createNewGroup = async (args: ICreateGroupArgs): Promise<IGroup> =>
  fetcher('groups', {
    method: 'POST',
    body: JSON.stringify(args),
  })

export const joinGroups = async (args: IJoinGroupArgs): Promise<IMember[]> =>
  fetcher('members', { method: 'POST', body: JSON.stringify(args) })

export const deleteGroup = async (groupId: number) =>
  fetcher(`groups/${groupId}`, { method: 'DELETE' })
