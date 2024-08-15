import { useAuth } from '@/hooks/useAuth'
import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchUserChats } from '../group.service'

export const useChats = () => {
  const { auth } = useAuth()
  const { data, isLoading, isSuccess, hasNextPage, fetchNextPage, error } =
    useInfiniteQuery({
      queryKey: ['userChats', auth],
      queryFn: async ({ pageParam }) => {
        return fetchUserChats({
          userId: auth!.id,
          limit: 15,
          cursor: pageParam,
        })
      },
      initialPageParam: null as number | null,
      getNextPageParam(lastPage) {
        return lastPage.cursor ? lastPage.cursor : undefined
      },
      enabled: !!auth?.id,
    })

  return {
    auth,
    data,
    isLoading,
    isSuccess,
    hasNextPage,
    fetchNextPage,
    error,
  }
}
