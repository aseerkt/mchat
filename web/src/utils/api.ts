import { getNewAccessToken } from '@/features/auth/auth.service'
import { config } from '../config'
import { accessToken } from './token'

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

let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []

const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback)
}

const onRefreshed = (token: string) => {
  refreshSubscribers.map(callback => callback(token))
}

export const baseFetch = async (path: string, options?: RequestInit) => {
  const token = accessToken.get()
  const defaultOptions: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
      ...options?.headers,
    },
  }
  const url = `${config.backendUrl}/api/${path}`

  const res = await fetch(url, defaultOptions)

  if (res.status !== 401) return res

  const setAuthHeader = (token: string) => {
    defaultOptions.headers = {
      ...defaultOptions.headers,
      Authorization: `Bearer ${token}`,
    }
  }

  if (isRefreshing) {
    return new Promise<Response>(resolve => {
      addRefreshSubscriber(newToken => {
        setAuthHeader(newToken)
        resolve(fetch(url, defaultOptions))
      })
    })
  }

  try {
    isRefreshing = true
    const result = await getNewAccessToken()
    if (result?.token) {
      onRefreshed(result.token)
      refreshSubscribers = []
      setAuthHeader(result.token)
    }
    return fetch(url, defaultOptions)
  } finally {
    isRefreshing = false
  }
}

export const fetcher = async (path: string, options?: RequestInit) => {
  const res = await baseFetch(path, options)

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
