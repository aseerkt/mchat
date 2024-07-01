export interface IUser {
  id: number
  username: string
  fullName: string
  password: string
  createdAt: string
}

export interface IUserResponse {
  user: IUser
  token: string
}

export interface ILoginVariables {
  username: string
  password: string
}

export interface ISignUpVariables extends ILoginVariables {
  fullName: string
}
