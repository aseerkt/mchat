import { config } from '../config'
import { getToken } from './token'

export const stringifyQueryParams = <
  TQueryParams extends Record<string, unknown>,
>(
  params: TQueryParams,
) => {
  const queryParams = new URLSearchParams()
  Object.keys(params).forEach(key => {
    const value = params[key] ? String(params[key]) : undefined
    if (value) {
      queryParams.append(key, value)
    }
  })
  return queryParams.toString()
}

export const fetcher = async (path: string, options?: RequestInit) => {
  const token = getToken()
  const res = await fetch(`${config.backendUrl}/api/${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
      ...options?.headers,
    },
  })

  const isJsonType = res.headers
    .get('Content-Type')
    ?.includes('application/json')

  const data = isJsonType ? await res.json() : await res.text()

  if (res.ok) {
    return data
  } else {
    throw new Error(data.message)
  }
}
