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

export interface IAuthPayload {
  id: number
  username: string
  fullName: string
}

export interface IAuthResponse {
  user: IAuthPayload
  token: string
}
