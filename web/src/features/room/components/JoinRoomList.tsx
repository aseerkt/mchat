import { Skeleton } from '@/components/Skeleton'
import { useInView } from '@/hooks/useInView'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Fragment, useRef } from 'react'
import { fetchRoomsToJoin } from '../room.service'
import { JoinRoomItem } from './JoinRoomItem'

interface JoinRoomListProps {
  isRoomChecked: (id: string) => boolean
  toggleRoomCheck: (id: string, checked: boolean) => void
}

export const JoinRoomList = ({
  isRoomChecked,
  toggleRoomCheck,
}: JoinRoomListProps) => {
  const { data, isLoading, error, isSuccess, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ['roomsToJoin'],
      queryFn: ({ pageParam }) =>
        fetchRoomsToJoin({ limit: 15, cursor: pageParam }),
      initialPageParam: '',
      getNextPageParam: lastPage =>
        lastPage.cursor ? lastPage.cursor : undefined,
    })

  const listRef = useRef(null)

  const watchElement = useInView(listRef, fetchNextPage, hasNextPage)

  let content

  if (error) {
    content = <div className='text-red-500'>Unable to fetch rooms</div>
  } else if (isLoading) {
    content = new Array(5).map((_, idx) => (
      <Skeleton key={idx} className='h-6 w-full' />
    ))
  } else if (data?.pages.length) {
    content = data.pages.map((page, i) => (
      <Fragment key={i}>
        {page.data.map(room => (
          <JoinRoomItem
            key={room._id}
            room={room}
            isChecked={isRoomChecked(room._id)}
            toggleRoomCheck={toggleRoomCheck}
          />
        ))}
      </Fragment>
    ))
  } else if (isSuccess) {
    content = <p>No more rooms to join</p>
  }

  return (
    <ul
      ref={listRef}
      className='mb-4 flex flex-1 flex-col overflow-y-auto border p-3'
    >
      {content}
      {watchElement}
    </ul>
  )
}
