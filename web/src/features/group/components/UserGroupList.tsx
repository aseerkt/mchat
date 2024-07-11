import { Skeleton } from '@/components/Skeleton'
import { useAuth } from '@/hooks/useAuth'
import { useInView } from '@/hooks/useInView'
import { getSocketIO } from '@/utils/socket'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { produce } from 'immer'
import { Fragment, useEffect, useRef } from 'react'
import { IGroup, IPaginatedInfiniteGroups } from '../group.interface'
import { fetchUserGroups } from '../group.service'
import { UserGroupItem } from './UserGroupItem'

export const UserGroupList = () => {
  const { auth } = useAuth()
  const queryClient = useQueryClient()
  const { data, isLoading, isSuccess, hasNextPage, fetchNextPage, error } =
    useInfiniteQuery({
      queryKey: ['userGroups', auth],
      queryFn: async ({ pageParam }) => {
        return fetchUserGroups({
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

  useEffect(() => {
    if (!auth) return

    const socket = getSocketIO()

    function unshiftGroup(group: IGroup) {
      queryClient.setQueryData<IPaginatedInfiniteGroups>(
        ['userGroups', auth],
        data => {
          if (!data) return
          const updatedData = produce(data, draft => {
            draft.pages[0].data.unshift(group)
          })
          return updatedData
        },
      )
    }

    socket.on('newGroup', unshiftGroup)

    return () => {
      socket.off('newGroup', unshiftGroup)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth])

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
        {data.pages.map((page, i) => (
          <Fragment key={i}>
            {page.data.map(group => (
              <UserGroupItem key={group.id} group={group} />
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
