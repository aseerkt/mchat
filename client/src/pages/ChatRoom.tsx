import { useCallback, useEffect, useRef, useState } from 'react'
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

  const appendMessage = useCallback(
    (message: Message) => {
      setMessagesData(prevMessages => [...(prevMessages ?? []), message])
    },
    [setMessagesData],
  )

  useEffect(() => {
    if (params.roomId && params.roomId !== roomRef.current) {
      const socket = getSocketIO()

      socket.emit('joinRoom', params.roomId)
      roomRef.current = params.roomId

      socket.on('typingUsers', setTypingUsers)
      socket.on('newMessage', appendMessage)
      return () => {
        socket.off('typingUsers', setTypingUsers)
        socket.off('newMessage', appendMessage)
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.roomId])

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
