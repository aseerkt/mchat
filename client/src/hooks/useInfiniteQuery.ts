import { useEffect, useRef, useState } from 'react'
import { config } from '../config'
import { getAuthHeaders } from '../utils/headers'
import { useQueryHasCache, useSetQueryCache } from './useQueryCache'

const stringifyQueryParams = <TQueryParams extends Record<string, unknown>>(
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

export const useInfiniteQuery = <TData extends { _id: string }, TError = Error>(
  path: string,
  fetchOptions?: RequestInit,
) => {
  const [data, setData] = useState<TData[]>()
  const [error, setError] = useState<TError>()
  const [loading, setLoading] = useState(false)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const queryParams = useRef({ limit: 15, cursor: '' })

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

    if (!res.ok) {
      throw jsonData
    }

    if (jsonData.data?.length) {
      queryParams.current.cursor = jsonData.data[jsonData.data.length - 1]._id
    }

    return jsonData
  }

  async function fetchInitialData() {
    if (!path) {
      return
    }
    queryParams.current.cursor = ''

    setLoading(true)
    setHasMore(false)
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

  useEffect(() => {
    fetchInitialData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path])

  useEffect(() => {
    if (!isCached && Array.isArray(data)) {
      fetchInitialData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCached])

  const fetchMore = async () => {
    if (!data?.length) return
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
