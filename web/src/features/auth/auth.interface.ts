import { IUser } from '../user/user.interface'

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
