import { useToast } from '@/hooks/useToast'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { IMember } from '../member.interface'
import { changeMemberRole } from '../member.service'

export const ChangeMemberRole = ({
  groupId,
  userId,
  initialRole,
  currentUserRole,
}: {
  groupId: number
  userId: number
  initialRole: IMember['role']
  currentUserRole?: IMember['role']
}) => {
  const { toast } = useToast()
  const { mutate, isPending } = useMutation({
    mutationFn: changeMemberRole,
    onSuccess() {
      toast({ title: 'Member role changed', severity: 'success' })
    },
    onError(error) {
      toast({ title: error.message, severity: 'error' })
    },
  })

  const [role, setRole] = useState(initialRole)

  return (
    <select
      onChange={e => {
        const newRole = e.target.value as IMember['role']
        mutate({ groupId, userId, role: newRole })
        setRole(newRole)
      }}
      disabled={isPending || initialRole === currentUserRole}
      value={role}
    >
      <option value='admin'>Admin</option>
      <option
        value='member'
        disabled={initialRole === 'admin' && currentUserRole === 'admin'}
      >
        Member
      </option>
    </select>
  )
}
