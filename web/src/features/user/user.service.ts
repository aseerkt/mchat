import { fetcher, stringifyQueryParams } from '@/utils/api'
import { IUser, TGetUsersQueryArgs } from './user.interface'

export const fetchUsers = async (args: TGetUsersQueryArgs): Promise<IUser[]> =>
  fetcher(`users?${stringifyQueryParams(args)}`)

export const fetchGroupNonMembers = async ({
  groupId,
  ...args
}: TGetUsersQueryArgs & { groupId: number }): Promise<IUser[]> =>
  fetcher(`groups/${groupId}/non-members?${stringifyQueryParams(args)}`)

export const fetchUser = async (userId: number): Promise<IUser> =>
  fetcher(`users/${userId}`)
