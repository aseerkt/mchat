export interface IUser {
  _id: string
  username: string
  password: string
  createdAt: string
  updatedAt: string
}

export interface IUserResponse {
  user: IUser
  token: string
}

export interface IAuthMutationVariables {
  username: string
  password: string
}
