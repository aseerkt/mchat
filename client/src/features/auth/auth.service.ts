import { fetcher } from '@/utils/api'
import { IAuthMutationVariables } from './auth.interface'

export const login = async (payload: IAuthMutationVariables) =>
  fetcher('users/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const signup = async (payload: IAuthMutationVariables) =>
  fetcher(`users`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
