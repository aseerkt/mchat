import { createContext } from 'react'

export type AuthPayload = {
  id: number
  username: string
}

export type TAuth = {
  auth?: AuthPayload
  setAuth: (auth?: AuthPayload) => void
}

export const AuthContext = createContext<TAuth>({ setAuth() {} })
