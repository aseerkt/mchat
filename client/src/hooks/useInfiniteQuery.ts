import { useEffect, useState } from 'react'
import { config } from '../config'
import { getAuthHeaders } from '../utils/headers'

const stringifyQueryParams = <TQueryParams extends Record<string, unknown>>(
  params: TQueryParams,
) => {
  const queryParams = new URLSearchParams()
  Object.keys(params).forEach(key =>
    queryParams.append(key, String(params[key])),
  )
  return queryParams.toString()
}

export const useInfiniteQuery = <
  TData = unknown,
  TQueryParams extends Record<string, unknown> = Record<string, unknown>,
  TError = Error,
>(
  path: string,
  queryParams: TQueryParams,
  fetchOptions?: RequestInit,
) => {
  const [data, setData] = useState<TData[]>()
  const [error, setError] = useState<TError>()
  const [loading, setLoading] = useState(false)
  const [isFetchingMore, setIsFetchingMore] = useState(false)

  const fetchData = async () => {
    const response = await fetch(
      `${config.backendUrl}${path}?${stringifyQueryParams(queryParams)}`,
      {
        ...fetchOptions,
        headers: {
          ...fetchOptions?.headers,
          ...getAuthHeaders(),
        },
      },
    )

    const jsonData = await response.json()
    if (response.ok) {
      return jsonData
    } else {
      throw jsonData
    }
  }

  useEffect(() => {
    if (!path) {
      return
    }
    async function fetchInitialData() {
      setLoading(true)
      try {
        const result = await fetchData()
        setData(result)
      } catch (error) {
        setError(error as TError)
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path])

  useEffect(() => {
    if (!data || data?.length === 0 || loading || isFetchingMore) {
      return
    }

    async function fetchNextData() {
      setIsFetchingMore(true)
      try {
        const result = await fetchData()
        setData(prev => [...(prev || []), ...result])
      } catch (error) {
        setError(error as TError)
      } finally {
        setIsFetchingMore(false)
      }
    }
    fetchNextData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams])

  return { data, setData, loading, isFetchingMore, error }
}
