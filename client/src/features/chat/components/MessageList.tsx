import { useEffect, useRef } from 'react'
import { Skeleton } from '../../../components/Skeleton'
import { useAuthState } from '../../../hooks/useAuth'
import { Message } from '../../../interfaces/message.interface'
import { MessageItem } from './MessageItem'

interface MessageListProps {
  loading: boolean
  messages: Message[] | null
}

export const MessageList = ({ messages, loading }: MessageListProps) => {
  const auth = useAuthState()

  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTo(0, listRef.current?.scrollHeight)
    }
  }, [messages])

  let content

  if (loading) {
    content = (
      <div className='flex flex-col-reverse justify-start gap-2 p-3'>
        {new Array(5).map((_, index) => (
          <Skeleton key={index} className='h-10' />
        ))}
      </div>
    )
  } else if (messages?.length) {
    content = (
      <div
        ref={listRef}
        className='flex h-full flex-col-reverse justify-start gap-2 overflow-y-auto p-3'
      >
        {messages.map(message => (
          <MessageItem
            key={message._id}
            message={message}
            isCurrentUser={auth?._id === message.sender._id}
          />
        ))}
        <div aria-label='scroll ref'></div>
      </div>
    )
  } else if (Array.isArray(messages)) {
    content = <p className='p-3 text-gray-700'>Be the first one to message</p>
  }

  return <main className='flex-1 overflow-hidden'>{content}</main>
}
