import { useQuery } from '@tanstack/react-query'
import { useCallback } from 'react'
import { IMember } from '../member.interface'
import { getCurrentMember } from '../member.service'

const memberRoles = ['member', 'admin', 'owner']

export const useCurrentMember = (groupId: number, enabled = true) => {
  const { data } = useQuery({
    queryKey: ['members', groupId, 'current'],
    queryFn: ({ queryKey }) => getCurrentMember(queryKey[1] as number),
    enabled,
  })

  const hasPermission = useCallback(
    (role: IMember['role']) =>
      data?.role
        ? memberRoles.indexOf(data.role) >= memberRoles.indexOf(role)
        : false,
    [data],
  )

  return { member: data, hasPermission }
}
