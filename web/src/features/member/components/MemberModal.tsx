import { Dialog } from '@/components/Dialog'
import { useQueryClient } from '@tanstack/react-query'
import { useGetMember, useHasPermission } from '../hooks'
import { ChangeMemberRole } from './ChangeMemberRole'
import { KickMember } from './KickMember'

export const MemberModal = ({
  groupId,
  userId,
  onClose,
}: {
  groupId: number
  userId?: number
  onClose: () => void
}) => {
  const { member } = useGetMember(groupId, userId, Boolean(userId))
  const { hasPermission, currentMember } = useHasPermission(groupId)
  const queryClient = useQueryClient()

  if (!member || !currentMember || !userId) {
    return null
  }
  const handleComplete = (close: boolean) => () => {
    queryClient.invalidateQueries({ queryKey: ['members', groupId] })
    if (close) {
      onClose()
    }
  }

  const notCurrentMember = currentMember.id !== member.id

  return (
    <Dialog isOpen={Boolean(userId)} onClose={onClose}>
      <div className='flex w-full flex-col gap-4'>
        <div className='flex items-center justify-center'>
          <img
            className='h-20 w-20 animate-pulse rounded-full bg-gray-200 ring-4'
            src='/gravatar.png'
            alt='avatar'
          />
        </div>
        <b>{member.username}</b>
        <span>{member.fullName}</span>
        {notCurrentMember && (
          <div className='flex gap-4'>
            {hasPermission('owner') && (
              <KickMember
                groupId={groupId}
                userId={userId}
                onComplete={handleComplete(true)}
              />
            )}
            {hasPermission('admin') && (
              <ChangeMemberRole
                groupId={groupId}
                userId={userId}
                initialRole={member.role}
                currentUserRole={currentMember?.role}
                onComplete={handleComplete(false)}
              />
            )}
          </div>
        )}
      </div>
    </Dialog>
  )
}
