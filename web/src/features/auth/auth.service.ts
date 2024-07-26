import { config } from '@/config'
import { fetcher } from '@/utils/api'
import { accessToken } from '@/utils/token'
import {
  IAuthResponse,
  ILoginVariables,
  ISignUpVariables,
} from './auth.interface'

export const login = async (payload: ILoginVariables) =>
  fetcher('users/login', {
    method: 'POST',
    body: JSON.stringify(payload),
    credentials: config.isDev ? 'include' : 'same-origin',
  })

export const signup = async (payload: ISignUpVariables) =>
  fetcher(`users`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const getNewAccessToken = async () => {
  const res = await fetch(`${config.backendUrl}/api/refresh`, {
    method: 'POST',
    credentials: config.isDev ? 'include' : 'same-origin',
  })

  if (!res.ok) {
    return null
  }

  const result = await res.json()

  accessToken.set(result.token)
  return result as IAuthResponse
}

export const logout = () =>
  fetcher('logout', {
    method: 'DELETE',
    credentials: config.isDev ? 'include' : 'same-origin',
  })
