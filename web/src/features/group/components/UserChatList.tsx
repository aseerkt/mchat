import { Alert } from '@/components/Alert'
import { Skeleton } from '@/components/Skeleton'
import { useAuth } from '@/hooks/useAuth'
import { useInView } from '@/hooks/useInView'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Fragment, useRef } from 'react'
import { fetchUserGroups } from '../group.service'
import { useChatSocketHandle } from '../hooks/useChatSocketHandle'
import { UserChatItem } from './UserChatItem'

export const UserChatList = () => {
  const { auth } = useAuth()
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

  useChatSocketHandle()

  let content

  if (error) {
    content = <Alert severity='error'>{error.message}</Alert>
  } else if (isLoading) {
    content = new Array(5).map((_, idx) => (
      <Skeleton key={idx} className='h-8 w-full' />
    ))
  } else if (data?.pages[0].data.length) {
    content = (
      <ul ref={listRef} className='flex h-full flex-col overflow-y-auto'>
        {data.pages.map((page, i) => (
          <Fragment key={i}>
            {page.data.map(chat => (
              <UserChatItem key={chat.groupId || chat.receiverId} chat={chat} />
            ))}
          </Fragment>
        ))}
        {watchElement}
      </ul>
    )
  } else if (isSuccess) {
    content = <Alert severity='info'>Join or create group</Alert>
  }

  return <aside className='flex-1 overflow-hidden'>{content}</aside>
}
