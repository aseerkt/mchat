import { useEffect, useState } from 'react'
import { config } from '../config'
import { getAuthHeaders } from '../utils/headers'

type UseQueryOptions = RequestInit & {
  baseUrl?: string
  pause?: boolean
  cache?: boolean
}

export const useQuery = <TData = unknown, TError = Error>(
  path: string,
  options?: UseQueryOptions,
) => {
  const [data, setData] = useState<TData>()
  const [error, setError] = useState<TError>()
  const [loading, setLoading] = useState(true)

  const baseUrl = options?.baseUrl || config.backendUrl

  useEffect(() => {
    async function fetchData() {
      if (options?.pause) return
      setLoading(true)
      try {
        const headers = getAuthHeaders()
        const res = await fetch(`${baseUrl}${path}`, {
          ...options,
          headers: { ...options?.headers, ...headers },
        })
        const data = await res.json()
        if (res.ok) {
          setData(data)
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
  }, [path, options])

  return { data, loading, error }
}
