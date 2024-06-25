import { useEffect, useRef, useState } from 'react'
import { config } from '../config'
import { getAuthHeaders } from '../utils/headers'
import { useQueryHasCache, useSetQueryCache } from './useQueryCache'

const stringifyQueryParams = <TQueryParams extends Record<string, unknown>>(
  params: TQueryParams,
) => {
  const queryParams = new URLSearchParams()
  Object.keys(params).forEach(key =>
    queryParams.append(key, String(params[key])),
  )
  return queryParams.toString()
}

export const useInfiniteQuery = <TData = unknown, TError = Error>(
  path: string,
  fetchOptions?: RequestInit,
) => {
  const [data, setData] = useState<TData[]>()
  const [error, setError] = useState<TError>()
  const [loading, setLoading] = useState(false)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const queryParams = useRef({ limit: 15, offset: 0 })

  const isCached = useQueryHasCache(path)
  const setQueryCache = useSetQueryCache()

  const fetchData = async () => {
    const res = await fetch(
      `${config.backendUrl}${path}?${stringifyQueryParams(queryParams.current)}`,
      {
        ...fetchOptions,
        headers: {
          ...fetchOptions?.headers,
          ...getAuthHeaders(),
        },
      },
    )

    const jsonData = await res.json()
    if (res.ok) {
      return jsonData
    } else {
      throw jsonData
    }
  }

  useEffect(() => {
    if (!path || isCached) {
      return
    }
    queryParams.current.offset = 0
    async function fetchInitialData() {
      setLoading(true)
      try {
        const result = await fetchData()
        setData(result.data)
        setHasMore(result.hasMore)
        setQueryCache(path)
      } catch (error) {
        setError(error as TError)
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, isCached])

  const fetchMore = async () => {
    queryParams.current.offset++
    setIsFetchingMore(true)
    try {
      const result = await fetchData()
      setData(prev => [...(prev || []), ...result.data])
      setHasMore(result.hasMore)
    } catch (error) {
      setError(error as TError)
    } finally {
      setIsFetchingMore(false)
    }
  }

  return { data, setData, hasMore, fetchMore, loading, isFetchingMore, error }
}
