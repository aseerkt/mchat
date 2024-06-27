import { config } from '../config'
import { getToken } from './token'

export const getAuthHeaders = () => {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  }
}

export const getUrl = (path: string) => {
  return `${config.backendUrl}/api/${path}`
}

export const stringifyQueryParams = <
  TQueryParams extends Record<string, unknown>,
>(
  params: TQueryParams,
) => {
  const queryParams = new URLSearchParams()
  Object.keys(params).forEach(key => {
    const value = String(params[key])
    if (value) {
      queryParams.append(key, value)
    }
  })
  return queryParams.toString()
}

export const fetcher = async (path: string, options?: RequestInit) => {
  const res = await fetch(getUrl(path), {
    ...options,
    headers: {
      ...getAuthHeaders(),
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
