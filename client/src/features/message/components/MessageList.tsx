import { useEffect, useRef } from 'react'
import { Skeleton } from '../../../components/Skeleton'
import { useAuthState } from '../../../hooks/useAuth'
import { useInfiniteQuery } from '../../../hooks/useInfiniteQuery'
import { useInfiniteScroll } from '../../../hooks/useInfiniteScroll'
import { IMessage } from '../../../interfaces/message.interface'
import { getSocketIO } from '../../../utils/socket'
import { MessageItem } from './MessageItem'

interface MessageListProps {
  roomId: string
}

export const MessageList = ({ roomId }: MessageListProps) => {
  const auth = useAuthState()

  const {
    data: messages,
    hasMore,
    fetchMore,
    setData: setMessagesData,
    loading,
  } = useInfiniteQuery<IMessage>(`/api/rooms/${roomId}/messages`)

  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const socket = getSocketIO()

    function updateMessage(message: IMessage) {
      function scrollToBottom() {
        listRef.current?.scrollTo(0, listRef.current?.scrollHeight)
      }
      setMessagesData(prevMessages => [message, ...(prevMessages ?? [])])
      setTimeout(scrollToBottom, 100)
    }

    socket.on('newMessage', updateMessage)
    return () => {
      socket.off('newMessage', updateMessage)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const scrollElement = useInfiniteScroll(listRef, fetchMore, hasMore)

  let content

  if (loading) {
    content = new Array(5).map((_, index) => (
      <Skeleton key={index} className='h-10' />
    ))
  } else if (messages?.length) {
    content = messages.map(message => (
      <MessageItem
        key={message._id}
        message={message}
        isCurrentUser={auth?._id === message.sender._id}
      />
    ))
  } else if (Array.isArray(messages)) {
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
