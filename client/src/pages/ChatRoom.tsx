import { useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { TypingIndicator } from '../features/chat/components'
import { MembersSidebar } from '../features/members/components'
import { MessageComposer, MessageList } from '../features/message/components'
import { RoomHeader } from '../features/room/components'
import { useDisclosure } from '../hooks/useDisclosure'
import { getSocketIO } from '../utils/socket'
import { cn } from '../utils/style'

export const Component = () => {
  const params = useParams()
  const roomRef = useRef<string>()
  const socket = useRef(getSocketIO())

  const { isOpen, toggle } = useDisclosure()

  useEffect(() => {
    if (params.roomId && params.roomId !== roomRef.current) {
      socket.current.emit('joinRoom', params.roomId)
      roomRef.current = params.roomId
    }
  }, [params.roomId])

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
            <MessageList roomId={params.roomId} />
            <TypingIndicator />
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
