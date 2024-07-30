import { Alert } from '@/components/Alert'
import { Skeleton } from '@/components/Skeleton'
import { IMessage } from '@/features/message/message.interface'
import { useAuth } from '@/hooks/useAuth'
import { useInView } from '@/hooks/useInView'
import { isToday, isYesterday } from '@/utils/date'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useCallback, useMemo, useRef, useState } from 'react'
import { useMessageSocketHandle } from '../hooks/useMessageSocketHandle'
import { fetchMessages } from '../message.service'
import { MessageActions } from './MessageActions'
import { MessageItem } from './MessageItem'

function getDateStampStr(date: Date) {
  let dateStr = ''

  if (isToday(date)) {
    dateStr = 'Today'
  } else if (isYesterday(date)) {
    dateStr = 'Yesterday'
  } else {
    dateStr = date.toDateString()
  }
  return dateStr
}

interface MessageListProps {
  groupId?: number
  partnerId?: number
  onReplyAction?: (message: IMessage) => void
}

export const MessageList = ({
  groupId,
  partnerId,
  onReplyAction,
}: MessageListProps) => {
  const { auth } = useAuth()
  const messageRefs = useRef<Record<number, HTMLDivElement | null>>({})
  const [messageAnchor, setMessageAnchor] = useState<{
    message: IMessage
    anchorRef: React.RefObject<HTMLButtonElement>
  } | null>()

  const { data, hasNextPage, fetchNextPage, isLoading, error, isSuccess } =
    useInfiniteQuery({
      queryKey: ['messages', { groupId, partnerId }],
      queryFn: ({ pageParam }) =>
        fetchMessages({
          groupId,
          partnerId,
          limit: 15,
          cursor: pageParam,
        }),
      initialPageParam: null as number | null,
      getNextPageParam: lastPage =>
        lastPage.cursor ? lastPage.cursor : undefined,
    })

  const listRef = useRef<HTMLDivElement>(null)

  const scrollElement = useInView(listRef, fetchNextPage, hasNextPage)

  const scrollToBottom = () => {
    setTimeout(() => {
      listRef.current?.scrollTo(0, listRef.current?.scrollHeight)
    }, 100)
  }

  useMessageSocketHandle({
    groupId,
    partnerId,
    afterNewMessage: scrollToBottom,
  })

  const scrollIntoParentMessage = useCallback((messageId: number) => {
    if (messageRefs.current[messageId]) {
      messageRefs.current[messageId]?.scrollIntoView({ behavior: 'smooth' })
      messageRefs.current[messageId]?.focus()
    }
  }, [])

  const handleMessageAction = useCallback(
    (message: IMessage, anchorRef: React.RefObject<HTMLButtonElement>) => {
      setMessageAnchor({ message, anchorRef })
    },
    [],
  )

  const resetMessageAction = useCallback(() => setMessageAnchor(null), [])

  const dateWiseMessages = useMemo(() => {
    const dateMessageMap: Record<string, IMessage[]> = {}
    if (data?.pages[0].data.length) {
      data.pages.forEach(page => {
        page.data.forEach(message => {
          const messageDate = new Date(message.createdAt)
          const dateStr = getDateStampStr(messageDate)

          dateMessageMap[dateStr] = (dateMessageMap[dateStr] || []).concat(
            message,
          )
        })
      })
    }
    return dateMessageMap
  }, [data])

  let content

  if (error) {
    content = <Alert severity='error'>{error.message}</Alert>
  } else if (isLoading) {
    content = new Array(5).map((_, index) => (
      <Skeleton key={index} className='h-10' />
    ))
  } else if (data?.pages[0].data.length) {
    content = Object.keys(dateWiseMessages).map(dateStr => (
      <div className='relative'>
        <div className='top sticky top-0 z-10 mx-auto my-3 w-max rounded-lg border bg-gray-500 px-4 py-2 text-sm font-semibold text-white shadow-md'>
          {dateStr}
        </div>
        <div className='flex flex-col-reverse gap-2'>
          {dateWiseMessages[dateStr].map(message => (
            <MessageItem
              ref={ref => (messageRefs.current[message.id] = ref)}
              key={message.id}
              message={message}
              isCurrentUser={message.senderId === auth?.id}
              onMessageAction={handleMessageAction}
              hasActionAnchor={message.id === messageAnchor?.message.id}
              onReplyAction={onReplyAction}
              scrollMessageIntoView={scrollIntoParentMessage}
            />
          ))}
        </div>
      </div>
    ))
  } else if (isSuccess) {
    content = <Alert severity='info'>Be the first to message</Alert>
  }

  return (
    <main className='flex-1 overflow-hidden'>
      <div
        ref={listRef}
        className='flex h-full flex-col-reverse justify-start gap-2 overflow-y-auto scroll-smooth py-3'
      >
        {content}
        {scrollElement}
        {messageAnchor && (
          <MessageActions
            anchorRef={messageAnchor.anchorRef}
            message={messageAnchor.message}
            onClose={resetMessageAction}
          />
        )}
      </div>
    </main>
  )
}
