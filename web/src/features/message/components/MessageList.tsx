import { Alert } from '@/components/Alert'
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
import { fetchMessages } from '../message.service'
import { MessageItem } from './MessageItem'

interface MessageListProps {
  groupId?: number
  receiverId?: number
}

export const MessageList = ({ groupId, receiverId }: MessageListProps) => {
  const { auth } = useAuth()

  const queryClient = useQueryClient()

  const { data, hasNextPage, fetchNextPage, isLoading, error, isSuccess } =
    useInfiniteQuery({
      queryKey: ['messages', { groupId, receiverId }],
      queryFn: ({ pageParam }) =>
        fetchMessages({ groupId, receiverId, limit: 15, cursor: pageParam }),
      initialPageParam: null as number | null,
      getNextPageParam: lastPage =>
        lastPage.cursor ? lastPage.cursor : undefined,
    })

  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const socket = getSocketIO()

    function updateMessage(message: IMessage) {
      if (groupId && message.groupId !== groupId) {
        return
      }
      if (receiverId && message.receiverId !== receiverId) {
        return
      }
      function scrollToBottom() {
        listRef.current?.scrollTo(0, listRef.current?.scrollHeight)
      }
      queryClient.setQueryData<TMessageInfiniteData>(
        ['messages', { groupId, receiverId }],
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
  }, [groupId, receiverId])

  const scrollElement = useInView(listRef, fetchNextPage, hasNextPage)

  let content

  if (error) {
    content = <Alert severity='error'>{error.message}</Alert>
  } else if (isLoading) {
    content = new Array(5).map((_, index) => (
      <Skeleton key={index} className='h-10' />
    ))
  } else if (data?.pages[0].data.length) {
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
    content = <Alert severity='info'>Be the first to message</Alert>
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
