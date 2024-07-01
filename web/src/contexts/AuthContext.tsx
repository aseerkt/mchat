import { createContext } from 'react'

export type Auth =
  | {
      id: number
      username: string
    }
  | undefined

type AuthDispatch = (auth?: Auth) => void

export const AuthContext = createContext<Auth>(undefined)
export const AuthDispatchContext = createContext<AuthDispatch>(() => {})
