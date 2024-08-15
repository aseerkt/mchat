import { Alert } from '@/components/Alert'
import { Skeleton } from '@/components/Skeleton'
import { useInView } from '@/hooks/useInView'
import { Fragment, useRef } from 'react'
import { useChatSocketHandle } from '../hooks/useChatSocketHandle'
import { JoinGroupsForm } from './JoinGroupForm'
import { UserChatItem } from './UserChatItem'

export const UserChatList = () => {
  const { data, isLoading, isSuccess, hasNextPage, fetchNextPage, error } =
    useChatSocketHandle()

  const listRef = useRef<HTMLUListElement>(null)

  const watchElement = useInView(listRef, fetchNextPage, hasNextPage)

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
              <UserChatItem key={chat.groupId || chat.partnerId} chat={chat} />
            ))}
          </Fragment>
        ))}
        {watchElement}
      </ul>
    )
  } else if (isSuccess) {
    content = (
      <div className='px-3 py-4'>
        <JoinGroupsForm />
      </div>
    )
  }

  return <aside className='flex-1 overflow-hidden'>{content}</aside>
}
