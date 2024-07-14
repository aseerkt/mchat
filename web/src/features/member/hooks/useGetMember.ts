import { useAuth } from '@/hooks/useAuth'
import { useQuery } from '@tanstack/react-query'
import { useCallback } from 'react'
import { IMember } from '../member.interface'
import { getMember } from '../member.service'

const memberRoles = ['member', 'admin', 'owner']

export const useGetMember = (
  groupId: number,
  userId?: number,
  enabled = true,
) => {
  const { data, isLoading } = useQuery({
    queryKey: ['members', groupId, userId],
    queryFn: ({ queryKey }) =>
      getMember(queryKey[1] as number, queryKey[2] as number),
    enabled,
  })

  return { member: data, isLoading }
}

export const useHasPermission = (groupId: number, enabled = true) => {
  const { auth } = useAuth()
  const { member } = useGetMember(
    groupId,
    auth?.id,
    Boolean(enabled && auth?.id),
  )

  const hasPermission = useCallback(
    (role: IMember['role']) =>
      member?.role
        ? memberRoles.indexOf(member.role) >= memberRoles.indexOf(role)
        : false,
    [member],
  )

  return { hasPermission, currentMemberRole: member?.role }
}
