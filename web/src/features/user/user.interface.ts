export interface IUser {
  id: number
  username: string
  fullName: string
  password: string
  createdAt: string
}

export type TGetUsersQueryArgs = {
  query: string
  limit: number
}
