import { useCallback, useState } from 'react'
import { config } from '../config'
import { getAuthHeaders } from '../utils/headers'

type UseMutationOptions = RequestInit & {
  baseUrl?: string
}

export const useMutation = <
  TData = unknown,
  TBody = Record<string, unknown>,
  TError = Error,
>(
  /**
   * path should start with '/'
   */
  path: string,
  options?: UseMutationOptions,
) => {
  const [data, setData] = useState<TData | null>(null)
  const [error, setError] = useState<TError | null>(null)
  const [loading, setLoading] = useState(false)

  const baseUrl = options?.baseUrl || config.backendUrl

  const mutate = useCallback(
    async (body: TBody) => {
      setLoading(true)
      setError(null)
      setData(null)

      try {
        const headers = getAuthHeaders()
        const res = await fetch(`${baseUrl}${path}`, {
          ...options,
          method: options?.method || 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
            ...headers,
          },
          body: JSON.stringify(body),
        })

        let responseData: TData
        const contentType = res.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          responseData = await res.json()
        } else {
          responseData = (await res.text()) as unknown as TData
        }

        if (res.ok) {
          setData(responseData)
          return responseData
        } else {
          const errorResponse = responseData as unknown as TError
          setError(errorResponse)
          throw errorResponse
        }
      } catch (error) {
        setError(error as TError)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [baseUrl, path, options],
  )

  return { mutate, data, loading, error }
}
