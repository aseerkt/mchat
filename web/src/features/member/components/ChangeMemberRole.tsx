import { Select } from '@/components/Select'
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
  onComplete,
}: {
  groupId: number
  userId: number
  initialRole: IMember['role']
  currentUserRole?: IMember['role']
  onComplete: () => void
}) => {
  const { toast } = useToast()
  const { mutate, isPending } = useMutation({
    mutationFn: changeMemberRole,
    onSuccess() {
      toast({ title: 'Member role changed', severity: 'success' })
      onComplete()
    },
    onError(error) {
      toast({ title: error.message, severity: 'error' })
    },
  })

  const [role, setRole] = useState(initialRole)

  const roleOptions = [
    {
      label: 'Admin',
      value: 'admin',
    },
    {
      label: 'Member',
      value: 'member',
      disabled: initialRole === 'admin' && currentUserRole === 'admin',
    },
  ]

  return (
    <Select
      options={roleOptions}
      value={role}
      onSelect={value => {
        const newRole = value as IMember['role']
        mutate({ groupId, userId, role: newRole })
        setRole(newRole)
      }}
      displayValue={value => `Role: ${value}`}
      disabled={isPending || initialRole === currentUserRole}
    />
  )
}
