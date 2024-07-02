import { Skeleton } from '@/components/Skeleton'
import { useInView } from '@/hooks/useInView'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Fragment, useRef } from 'react'
import { fetchGroupsToJoin } from '../group.service'
import { JoinGroupItem } from './JoinGroupItem'

interface JoinGroupListProps {
  isGroupChecked: (id: number) => boolean
  toggleGroupCheck: (id: number, checked: boolean) => void
}

export const JoinGroupList = ({
  isGroupChecked,
  toggleGroupCheck,
}: JoinGroupListProps) => {
  const { data, isLoading, error, isSuccess, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ['groupsToJoin'],
      queryFn: ({ pageParam }) =>
        fetchGroupsToJoin({ limit: 15, cursor: pageParam }),
      initialPageParam: null as number | null,
      getNextPageParam: lastPage =>
        lastPage.cursor ? lastPage.cursor : undefined,
    })

  const listRef = useRef(null)

  const watchElement = useInView(listRef, fetchNextPage, hasNextPage)

  let content

  if (error) {
    content = <div className='text-red-500'>Unable to fetch groups</div>
  } else if (isLoading) {
    content = new Array(5).map((_, idx) => (
      <Skeleton key={idx} className='h-6 w-full' />
    ))
  } else if (data?.pages.length) {
    content = data.pages.map((page, i) => (
      <Fragment key={i}>
        {page.data.map(group => (
          <JoinGroupItem
            key={group.id}
            group={group}
            isChecked={isGroupChecked(group.id)}
            toggleGroupCheck={toggleGroupCheck}
          />
        ))}
      </Fragment>
    ))
  } else if (isSuccess) {
    content = <p>No more groups to join</p>
  }

  return (
    <ul
      ref={listRef}
      className='scroll- mb-4 flex flex-1 flex-col overflow-y-auto border p-3'
    >
      {content}
      {watchElement}
    </ul>
  )
}
