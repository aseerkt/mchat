import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  MessageList,
  RoomHeader,
  TypingIndicators,
} from '../features/chat/components'
import { MembersSidebar } from '../features/chat/components/MembersSidebar'
import { MessageComposer } from '../features/chat/components/MessageComposer'
import { useDisclosure } from '../hooks/useDisclosure'
import { useQuery } from '../hooks/useQuery'
import { Message } from '../interfaces/message.interface'
import { getSocketIO } from '../utils/socket'
import { cn } from '../utils/style'

export const Component = () => {
  const params = useParams()
  const roomRef = useRef<string>()
  const socket = useRef(getSocketIO())
  const [typingUsers, setTypingUsers] = useState<
    Array<{ _id: string; username: string }>
  >([])

  const { isOpen, toggle } = useDisclosure()

  const {
    data: messages,
    setData: setMessagesData,
    loading,
  } = useQuery<Message[]>(
    params.roomId ? `/api/rooms/${params.roomId}/messages` : '',
  )

  useEffect(() => {
    if (params.roomId && params.roomId !== roomRef.current) {
      socket.current.emit('joinRoom', params.roomId)
      roomRef.current = params.roomId
    }
  }, [params.roomId])

  useEffect(() => {
    function updateMessage(message: Message) {
      setMessagesData(prevMessages => [message, ...(prevMessages ?? [])])
    }

    socket.current.on('typingUsers', setTypingUsers)
    socket.current.on('newMessage', updateMessage)

    return () => {
      socket.current.off('typingUsers', setTypingUsers)
      // eslint-disable-next-line react-hooks/exhaustive-deps
      socket.current.off('newMessage', updateMessage)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      {params.roomId && (
        <>
          <div
            className={cn(
              'flex h-full flex-1 flex-col overflow-hidden',
              isOpen && 'hidden md:flex',
            )}
          >
            <RoomHeader roomId={params.roomId} showMembers={toggle} />
            <MessageList messages={messages ?? []} loading={loading} />
            <TypingIndicators users={typingUsers} />
            <MessageComposer roomId={params.roomId} />
          </div>
          <MembersSidebar
            isOpen={isOpen}
            onClose={toggle}
            roomId={params.roomId}
          />
        </>
      )}
    </>
  )
}

Component.displayName = 'ChatRoom'
