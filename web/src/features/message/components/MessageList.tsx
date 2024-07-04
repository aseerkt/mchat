import { Skeleton } from '@/components/Skeleton'
import {
  IMessage,
  TMessageInfiniteData,
} from '@/features/message/message.interface'
import { useAuth } from '@/hooks/useAuth'
import { useInView } from '@/hooks/useInView'
import { getSocketIO } from '@/utils/socket'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { produce } from 'immer'
import { Fragment, useEffect, useRef } from 'react'
import { fetchGroupMessages } from '../message.service'
import { MessageItem } from './MessageItem'

interface MessageListProps {
  groupId: number
}

export const MessageList = ({ groupId }: MessageListProps) => {
  const { auth } = useAuth()

  const queryClient = useQueryClient()

  const { data, hasNextPage, fetchNextPage, isLoading, error, isSuccess } =
    useInfiniteQuery({
      queryKey: ['messages', groupId],
      queryFn: ({ pageParam }) =>
        fetchGroupMessages({ groupId, limit: 15, cursor: pageParam }),
      initialPageParam: null as number | null,
      getNextPageParam: lastPage =>
        lastPage.cursor ? lastPage.cursor : undefined,
    })

  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const socket = getSocketIO()

    function updateMessage(message: IMessage) {
      function scrollToBottom() {
        listRef.current?.scrollTo(0, listRef.current?.scrollHeight)
      }
      queryClient.setQueryData<TMessageInfiniteData>(
        ['messages', groupId],
        data => {
          if (!data) return

          const updatedData = produce(data, draft => {
            draft.pages[0].data.unshift(message)
          })
          return updatedData
        },
      )
      setTimeout(scrollToBottom, 100)
    }

    socket.on('newMessage', updateMessage)
    return () => {
      socket.off('newMessage', updateMessage)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId])

  const scrollElement = useInView(listRef, fetchNextPage, hasNextPage)

  let content

  if (error) {
    content = <p className='text-red-500'>{error.message}</p>
  } else if (isLoading) {
    content = new Array(5).map((_, index) => (
      <Skeleton key={index} className='h-10' />
    ))
  } else if (data?.pages.length) {
    content = data.pages.map((page, i) => (
      <Fragment key={i}>
        {page.data.map(message => (
          <MessageItem
            key={message.id}
            message={message}
            isCurrentUser={message.senderId === auth?.id}
          />
        ))}
      </Fragment>
    ))
  } else if (isSuccess) {
    content = <p className='p-3 text-gray-700'>Be the first one to message</p>
  }

  return (
    <main className='flex-1 overflow-hidden'>
      <div
        ref={listRef}
        className='flex h-full flex-col-reverse justify-start gap-2 overflow-y-auto p-3'
      >
        {content}
        {scrollElement}
      </div>
    </main>
  )
}
