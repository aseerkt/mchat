import { PageLoader } from '@/components/PageLoader'
import { ChatHeader, TypingIndicator } from '@/features/chat/components'
import { MessageComposer, MessageList } from '@/features/message/components'
import { fetchUser } from '@/features/user/user.service'
import { getSocketIO } from '@/utils/socket'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

export const Component = () => {
  const params = useParams<{ receiverId: string }>()

  const receiverId = Number(params.receiverId)

  useEffect(() => {
    if (receiverId) {
      const socket = getSocketIO()
      // TODO: only mark dm as read if it has unread messages
      socket.emit('markChatMessagesAsRead', { receiverId })
    }
  }, [receiverId])

  const {
    data: receiver,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['user', receiverId],
    queryFn: ({ queryKey }) => fetchUser(queryKey[1] as number),
    enabled: Boolean(receiverId),
  })

  if (isLoading) {
    return <PageLoader />
  }

  return (
    <>
      <div className='flex h-full flex-1 flex-col overflow-hidden'>
        <ChatHeader
          chatId={receiver?.id}
          chatName={receiver?.username}
          error={error}
        />
        <MessageList receiverId={receiverId} />
        <TypingIndicator />
        <MessageComposer receiverId={receiverId} />
      </div>
    </>
  )
}

Component.displayName = 'ChatDM'
