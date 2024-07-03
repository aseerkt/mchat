import {
  IPaginatedResult,
  TPaginatedParams,
} from '@/interfaces/common.interface'
import { fetcher, stringifyQueryParams } from '@/utils/api'
import {
  ICreateGroupArgs,
  IGroup,
  TGetUserGroupsQueryVariables,
} from './group.interface'

export const fetchUserGroups = async ({
  userId,
  ...params
}: TGetUserGroupsQueryVariables): Promise<IPaginatedResult<IGroup>> =>
  fetcher(`users/${userId}/groups?${stringifyQueryParams(params)}`)

export const fetchGroupsToJoin = async (
  params: TPaginatedParams,
): Promise<IPaginatedResult<IGroup>> =>
  fetcher(`groups?${stringifyQueryParams(params)}`)

export const createNewGroup = async (args: ICreateGroupArgs): Promise<IGroup> =>
  fetcher('groups', {
    method: 'POST',
    body: JSON.stringify(args),
  })

export const fetchGroup = async (groupId: number): Promise<IGroup> =>
  fetcher(`groups/${groupId}`, {})
