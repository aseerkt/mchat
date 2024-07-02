import { TypingIndicator } from '@/features/chat/components'
import { GroupHeader } from '@/features/group/components'
import { MembersSidebar } from '@/features/member/components'
import { MessageComposer, MessageList } from '@/features/message/components'
import { useDisclosure } from '@/hooks/useDisclosure'
import { getSocketIO } from '@/utils/socket'
import { cn } from '@/utils/style'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

export const Component = () => {
  const params = useParams<{ groupId: string }>()

  const groupId = Number(params.groupId)

  const { isOpen, toggle } = useDisclosure()

  useEffect(() => {
    const socket = getSocketIO()
    if (groupId) {
      socket.emit('joinGroup', Number(groupId))
    }
  }, [groupId])

  if (!groupId) return null

  return (
    <>
      <div
        className={cn(
          'flex h-full flex-1 flex-col overflow-hidden',
          isOpen && 'hidden md:flex',
        )}
      >
        <GroupHeader groupId={groupId} showMembers={toggle} />
        <MessageList groupId={groupId} />
        <TypingIndicator />
        <MessageComposer groupId={groupId} />
      </div>
      <MembersSidebar isOpen={isOpen} onClose={toggle} groupId={groupId} />
    </>
  )
}

Component.displayName = 'ChatRoom'
