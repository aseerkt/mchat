import { useInfiniteQuery } from '@tanstack/react-query'
import { Fragment, useRef } from 'react'
import { Skeleton } from '../../../components/Skeleton'
import { useAuthState } from '../../../hooks/useAuth'
import { useInView } from '../../../hooks/useInView'
import { fetchUserRooms } from '../group.service'
import { UserRoomItem } from './UserGroupItem'

export const GroupList = () => {
  const auth = useAuthState()
  const { data, isLoading, isSuccess, hasNextPage, fetchNextPage, error } =
    useInfiniteQuery({
      queryKey: ['userRooms', auth],
      queryFn: async ({ pageParam }) => {
        return fetchUserRooms({
          userId: auth!.id,
          limit: 15,
          cursor: pageParam,
        })
      },
      initialPageParam: null as number | null,
      getNextPageParam(lastPage) {
        return lastPage.cursor ? lastPage.cursor : undefined
      },
      enabled: Boolean(auth?.id),
    })

  const listRef = useRef<HTMLUListElement>(null)

  const watchElement = useInView(listRef, fetchNextPage, hasNextPage)

  let content

  if (error) {
    content = <p className='text-red-500'>{error.message}</p>
  } else if (isLoading) {
    content = new Array(5).map((_, idx) => (
      <Skeleton key={idx} className='h-8 w-full' />
    ))
  } else if (data?.pages.length) {
    content = (
      <ul ref={listRef} className='flex h-full flex-col overflow-y-auto'>
        {data.pages.map((room, i) => (
          <Fragment key={i}>
            {room.data.map(room => (
              <UserRoomItem key={room.id} room={room} />
            ))}
          </Fragment>
        ))}
        {watchElement}
      </ul>
    )
  } else if (isSuccess) {
    content = <p className='p-3 text-gray-700'>Join or create group</p>
  }

  return <aside className='flex-1 overflow-hidden'>{content}</aside>
}
