import { useRef } from 'react'
import { Skeleton } from '../../../components/Skeleton'
import { useAuthState } from '../../../hooks/useAuth'
import { useInfiniteQuery } from '../../../hooks/useInfiniteQuery'
import { useInfiniteScroll } from '../../../hooks/useInfiniteScroll'
import { IRoom } from '../../../interfaces/room.interface'
import { RoomItem } from './RoomItem'

export const RoomList = () => {
  const auth = useAuthState()
  const {
    data: rooms,
    loading,
    hasMore,
    fetchMore,
    error,
  } = useInfiniteQuery<IRoom>(auth?._id ? `/api/users/${auth._id}/rooms` : '')

  const listRef = useRef<HTMLUListElement>(null)

  const watchElement = useInfiniteScroll(listRef, fetchMore, hasMore)

  let content

  if (error) {
    content = <p className='text-red-500'>{error.message}</p>
  } else if (loading) {
    content = new Array(5).map((_, idx) => (
      <Skeleton key={idx} className='h-8 w-full' />
    ))
  } else if (rooms?.length) {
    content = (
      <ul ref={listRef} className='flex h-full flex-col overflow-y-auto'>
        {rooms?.map(room => <RoomItem key={room._id} room={room} />)}
        {watchElement}
      </ul>
    )
  } else if (Array.isArray(rooms)) {
    content = <p className='p-3 text-gray-700'>Join or create room</p>
  }

  return <aside className='flex-1 overflow-hidden'>{content}</aside>
}
