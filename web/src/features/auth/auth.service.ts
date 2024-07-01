import { fetcher } from '@/utils/api'
import { ILoginVariables, ISignUpVariables } from './auth.interface'

export const login = async (payload: ILoginVariables) =>
  fetcher('users/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const signup = async (payload: ISignUpVariables) =>
  fetcher(`users`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
