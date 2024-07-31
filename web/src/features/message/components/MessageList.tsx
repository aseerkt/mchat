import { Alert } from '@/components/Alert'
import { Skeleton } from '@/components/Skeleton'
import { IMessage } from '@/features/message/message.interface'
import { useAuth } from '@/hooks/useAuth'
import { useDisclosure } from '@/hooks/useDisclosure'
import { useInView } from '@/hooks/useInView'
import { isToday, isYesterday } from '@/utils/date'
import { useInfiniteQuery } from '@tanstack/react-query'
import { ArrowDown } from 'lucide-react'
import { useCallback, useMemo, useRef, useState } from 'react'
import { useMessageSocketHandle } from '../hooks/useMessageSocketHandle'
import { fetchMessages } from '../message.service'
import { MessageActions } from './MessageActions'
import { MessageItem } from './MessageItem'

const MESSAGE_LIST_OFFSET = -200

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

  const listRef = useRef<HTMLUListElement>(null)
  const {
    isOpen: hasNewMessage,
    open: showNewMessageBtn,
    close: hideNewMessageBtn,
  } = useDisclosure()

  const scrollElement = useInView(listRef, fetchNextPage, hasNextPage)

  const scrollToBottom = () => {
    listRef.current?.scrollTo(0, listRef.current?.scrollHeight)
  }

  function handleAfterNewMessage(message: IMessage) {
    if (!listRef.current) return

    if (
      message.senderId === auth?.id ||
      listRef.current.scrollTop > MESSAGE_LIST_OFFSET
    ) {
      setTimeout(scrollToBottom, 100)
    } else if (!hasNewMessage) {
      showNewMessageBtn()
    }
  }

  function handleListScroll() {
    if (listRef.current!.scrollTop > MESSAGE_LIST_OFFSET && hasNewMessage) {
      hideNewMessageBtn()
    }
  }

  useMessageSocketHandle({
    groupId,
    partnerId,
    onAfterNewMessage: handleAfterNewMessage,
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
    content = Object.keys(dateWiseMessages).map(dateStr => (
      <li className='relative' key={dateStr}>
        <div className='top sticky top-0 z-10 mx-auto my-3 w-max rounded-lg border bg-gray-500 px-2 py-1 text-xs font-semibold text-white shadow-md'>
          {dateStr}
        </div>
        <ul className='flex flex-col-reverse gap-2'>
          {dateWiseMessages[dateStr].map(message => (
            <MessageItem
              key={message.id}
              ref={ref => (messageRefs.current[message.id] = ref)}
              message={message}
              isCurrentUser={message.senderId === auth?.id}
              onMessageAction={handleMessageAction}
              hasActionAnchor={message.id === messageAnchor?.message.id}
              onReplyAction={onReplyAction}
              scrollMessageIntoView={scrollIntoParentMessage}
            />
          ))}
        </ul>
      </li>
    ))
  } else if (isSuccess) {
    content = <Alert severity='info'>Be the first to message</Alert>
  }

  return (
    <main className='relative flex-1 overflow-hidden'>
      <ul
        id='message-list'
        ref={listRef}
        className='relative flex h-full flex-col-reverse justify-start gap-2 overflow-y-auto scroll-smooth py-3'
        onScroll={handleListScroll}
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
      </ul>
      {hasNewMessage && (
        <button
          className='absolute inset-x-0 bottom-5 z-10 mx-auto inline-flex w-fit animate-bounce items-center gap-2 rounded-full bg-blue-950 py-1 pl-2 pr-3 text-sm text-white shadow-lg ring'
          onClick={scrollToBottom}
        >
          <ArrowDown size={12} />
          New message
        </button>
      )}
    </main>
  )
}
