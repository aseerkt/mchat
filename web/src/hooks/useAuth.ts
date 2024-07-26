import { config } from '@/config'
import { IAuthResponse } from '@/features/auth/auth.interface'
import { getNewAccessToken } from '@/features/auth/auth.service'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

export const useAuth = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['userToken'],
    queryFn: () => getNewAccessToken(),
    refetchInterval: config.accessTokenExpiry, // mark the cache as stale after access token expiry
    staleTime: config.accessTokenExpiry,
  })

  return { auth: data?.user, isLoading, error }
}

export const useAuthSetter = () => {
  const queryClient = useQueryClient()

  const setAuth = useCallback((userResponse: IAuthResponse) => {
    queryClient.setQueryData(['userToken'], () => userResponse)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const clearAuth = useCallback(() => {
    queryClient.setQueryData(['userToken'], () => null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { setAuth, clearAuth }
}
