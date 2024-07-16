import { PageLoader } from '@/components/PageLoader'
import { ChatHeader, TypingIndicator } from '@/features/chat/components'
import { GroupInfo } from '@/features/chat/layouts'
import { DeleteGroup } from '@/features/group/components/DeleteGroup'
import { fetchGroup } from '@/features/group/group.service'
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
import { useQuery } from '@tanstack/react-query'
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
      socket.emit('markChatMessagesAsRead', { groupId })
    }
  }, [groupId])

  const { hasPermission } = useHasPermission(groupId)

  const {
    data: group,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['currentGroup', groupId],
    queryFn: ({ queryKey }) => fetchGroup(queryKey[1] as number),
    enabled: Boolean(groupId),
  })

  if (isLoading) {
    return <PageLoader />
  }

  return (
    <>
      <div
        className={cn(
          'flex h-full flex-1 flex-col overflow-hidden',
          isOpen && 'hidden md:flex',
        )}
      >
        <ChatHeader
          chatId={group?.id}
          chatName={group?.name}
          error={error}
          toggleGroupInfo={toggle}
        />
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
