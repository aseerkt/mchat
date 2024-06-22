import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  MessageList,
  RoomHeader,
  TypingIndicators,
} from '../features/chat/components'
import { MessageComposer } from '../features/chat/components/MessageComposer'
import { useInfiniteQuery } from '../hooks/useInfiniteQuery'
import { Message } from '../interfaces/message.interface'
import { getSocketIO } from '../utils/socket'

export const Component = () => {
  const params = useParams()
  const roomRef = useRef<string>()
  const socket = useRef(getSocketIO())
  const [typingUsers, setTypingUsers] = useState<
    Array<{ _id: string; username: string }>
  >([])

  const [pageParams, setPageParams] = useState({ limit: 10, offset: 0 })

  const {
    data: messages,
    setData: setMessagesData,
    loading,
  } = useInfiniteQuery<Message>(
    params.roomId ? `/api/rooms/${params.roomId}/messages` : '',
    pageParams,
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
          <RoomHeader roomId={params.roomId} />
          <MessageList messages={messages ?? []} loading={loading} />
          <TypingIndicators users={typingUsers} />
          <MessageComposer roomId={params.roomId} />
        </>
      )}
    </>
  )
}

Component.displayName = 'ChatRoom'
