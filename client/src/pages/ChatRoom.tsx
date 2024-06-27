import { TypingIndicator } from '@/features/chat/components'
import { MembersSidebar } from '@/features/member/components'
import { MessageComposer, MessageList } from '@/features/message/components'
import { RoomHeader } from '@/features/room/components'
import { useDisclosure } from '@/hooks/useDisclosure'
import { getSocketIO } from '@/utils/socket'
import { cn } from '@/utils/style'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

export const Component = () => {
  const params = useParams<{ roomId: string }>()

  const { isOpen, toggle } = useDisclosure()

  useEffect(() => {
    const socket = getSocketIO()
    if (params.roomId) {
      socket.emit('joinRoom', params.roomId)
    }
  }, [params.roomId])

  if (!params.roomId) return null

  return (
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
      <MembersSidebar isOpen={isOpen} onClose={toggle} roomId={params.roomId} />
    </>
  )
}

Component.displayName = 'ChatRoom'
