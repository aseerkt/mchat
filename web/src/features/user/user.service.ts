import { fetcher, stringifyQueryParams } from '@/utils/api'
import { IUser, TGetUsersQueryArgs } from './user.interface'

export const fetchUsers = async (
  args: TGetUsersQueryArgs,
): Promise<IUser[]> => {
  return fetcher(`users?${stringifyQueryParams(args)}`)
}

export const fetchGroupNonMembers = async ({
  groupId,
  ...args
}: TGetUsersQueryArgs & { groupId: number }): Promise<IUser[]> => {
  return fetcher(`groups/${groupId}/non-members?${stringifyQueryParams(args)}`)
}
