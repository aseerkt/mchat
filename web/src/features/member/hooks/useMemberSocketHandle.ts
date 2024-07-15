import { useAuth } from '@/hooks/useAuth'
import { IPaginatedResult } from '@/interfaces/common.interface'
import { getSocketIO } from '@/utils/socket'
import { InfiniteData, useQueryClient } from '@tanstack/react-query'
import { produce } from 'immer'
import { useEffect } from 'react'
import { IMember } from '../member.interface'

type MemberInfiniteData = InfiniteData<IPaginatedResult<IMember>, string>

type MemberUpdater = (data: MemberInfiniteData) => MemberInfiniteData

export const useMemberSocketHandle = (groupId: number) => {
  const queryClient = useQueryClient()
  const { auth } = useAuth()

  useEffect(() => {
    const socket = getSocketIO()

    const updateMemberList = (updater: MemberUpdater) => {
      queryClient.setQueryData<MemberInfiniteData>(
        ['members', groupId],
        data => {
          if (!data) return
          return updater(data)
        },
      )
    }

    function setUserOnlineStatus(userId: number, online: boolean) {
      updateMemberList(data => {
        return produce(data, draft => {
          let member: IMember | undefined
          draft.pages.forEach(page => {
            page.data.forEach(m => {
              if (m.userId === userId) member = m
            })
          })
          if (member) {
            member.online = online
          }
        })
      })
    }

    function handleNewMember(member: IMember) {
      updateMemberList(data => {
        return produce(data, draft => {
          draft.pages[0].data.unshift({ ...member, online: true })
        })
      })
    }

    function handleOnlineUser(userId: number) {
      setUserOnlineStatus(userId, true)
    }

    function handleOfflineUser(userId: number) {
      setUserOnlineStatus(userId, false)
    }

    function handleNewMembers() {
      queryClient.invalidateQueries({ queryKey: ['members', groupId] })
    }

    function handleMemberLeft({
      groupId: leftGroupId,
      memberId,
    }: {
      groupId: number
      memberId: number
    }) {
      if (auth?.id === memberId || leftGroupId !== groupId) return
      updateMemberList(data => {
        return produce(data, draft => {
          draft.pages.forEach(page => {
            page.data.forEach((member, memberIndex) => {
              if (member.userId === memberId) {
                page.data.splice(memberIndex, 1)
              }
            })
          })
        })
      })
    }

    socket.on('newMember', handleNewMember)
    socket.on('newMembers', handleNewMembers)
    socket.on('userOnline', handleOnlineUser)
    socket.on('userOffline', handleOfflineUser)
    socket.on('memberLeft', handleMemberLeft)
    return () => {
      socket.off('newMember', handleNewMember)
      socket.off('newMembers', handleNewMembers)
      socket.off('userOnline', handleOnlineUser)
      socket.off('userOffline', handleOfflineUser)
      socket.off('memberLeft', handleMemberLeft)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId])
}
