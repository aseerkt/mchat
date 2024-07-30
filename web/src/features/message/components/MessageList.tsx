import { Alert } from '@/components/Alert'
import { Skeleton } from '@/components/Skeleton'
import { IMessage } from '@/features/message/message.interface'
import { useAuth } from '@/hooks/useAuth'
import { useInView } from '@/hooks/useInView'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Fragment, useCallback, useRef, useState } from 'react'
import { useMessageSocketHandle } from '../hooks/useMessageSocketHandle'
import { fetchMessages } from '../message.service'
import { MessageActions } from './MessageActions'
import { MessageItem } from './MessageItem'

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
      </Fragment>
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
