import { Dialog } from '@/components/Dialog'
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
  const { hasPermission, currentMemberRole } = useHasPermission(groupId)

  if (!member || !userId) {
    return null
  }

  return (
    <Dialog isOpen={Boolean(userId)} onClose={onClose}>
      <div className='flex w-full max-w-[450px] flex-col gap-4'>
        <b>{member.username}</b>
        <span>{member.fullName}</span>
        <span>role: {member.role}</span>
        <div className='flex gap-4'>
          {hasPermission('owner') && (
            <KickMember
              groupId={groupId}
              userId={userId}
              onComplete={onClose}
            />
          )}
          {hasPermission('admin') && (
            <ChangeMemberRole
              groupId={groupId}
              userId={userId}
              initialRole={member.role}
              currentUserRole={currentMemberRole}
            />
          )}
        </div>
      </div>
    </Dialog>
  )
}
