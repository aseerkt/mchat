import { TypingIndicator } from '@/features/chat/components'
import { RoomHeader } from '@/features/group/components'
import { MembersSidebar } from '@/features/member/components'
import { MessageComposer, MessageList } from '@/features/message/components'
import { useDisclosure } from '@/hooks/useDisclosure'
import { getSocketIO } from '@/utils/socket'
import { cn } from '@/utils/style'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

export const Component = () => {
  const params = useParams<{ groupId: number }>()

  const { isOpen, toggle } = useDisclosure()

  useEffect(() => {
    const socket = getSocketIO()
    if (params.groupId) {
      socket.emit('joinRoom', params.groupId)
    }
  }, [params.groupId])

  if (!params.groupId) return null

  return (
    <>
      <div
        className={cn(
          'flex h-full flex-1 flex-col overflow-hidden',
          isOpen && 'hidden md:flex',
        )}
      >
        <RoomHeader groupId={params.groupId} showMembers={toggle} />
        <MessageList groupId={params.groupId} />
        <TypingIndicator />
        <MessageComposer groupId={params.groupId} />
      </div>
      <MembersSidebar
        isOpen={isOpen}
        onClose={toggle}
        groupId={params.groupId}
      />
    </>
  )
}

Component.displayName = 'ChatRoom'
