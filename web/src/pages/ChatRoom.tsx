import { TypingIndicator } from '@/features/chat/components'
import { GroupInfo } from '@/features/chat/layouts'
import { GroupHeader } from '@/features/group/components'
import { DeleteGroup } from '@/features/group/components/DeleteGroup'
import {
  AddMembers,
  LeaveGroup,
  MemberList,
} from '@/features/member/components'
import { useHasPermission } from '@/features/member/hooks'
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
      // TODO: only mark group as read if it has unread messages
      socket.emit('markGroupMessagesAsRead', groupId)
    }
  }, [groupId])

  const { hasPermission } = useHasPermission(groupId)

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
      <GroupInfo isOpen={isOpen} onClose={toggle} groupId={groupId}>
        <MemberList groupId={groupId} />
        <div className='flex w-full flex-col gap-2 p-3'>
          <LeaveGroup />
          {hasPermission('owner') && <DeleteGroup groupId={groupId} />}
          {hasPermission('admin') && <AddMembers />}
        </div>
      </GroupInfo>
    </>
  )
}

Component.displayName = 'ChatRoom'
