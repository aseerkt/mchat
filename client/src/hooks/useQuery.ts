import { useEffect, useRef, useState } from 'react'
import { config } from '../config'
import { getAuthHeaders } from '../utils/headers'
import { useQueryHasCache, useSetQueryCache } from './useQueryCache'

export const useQuery = <TData = unknown, TError = Error>(
  path: string,
  fetchOptions?: RequestInit,
) => {
  const [data, setData] = useState<TData>()
  const [error, setError] = useState<TError>()
  const [loading, setLoading] = useState(true)

  const pathRef = useRef(path)
  const isCached = useQueryHasCache(path)
  const setQueryCache = useSetQueryCache()

  useEffect(() => {
    if (pathRef.current === path && isCached) {
      return
    }
    async function fetchData() {
      setLoading(true)
      try {
        const res = await fetch(`${config.backendUrl}${path}`, {
          ...fetchOptions,
          headers: { ...fetchOptions?.headers, ...getAuthHeaders() },
        })
        const data = await res.json()
        if (res.ok) {
          pathRef.current = path
          setData(data)
          setQueryCache(path)
        } else {
          setError(data)
        }
      } catch (error) {
        setError(error as TError)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCached, path])

  return { data, loading, error }
}
