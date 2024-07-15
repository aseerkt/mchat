import { IMessage } from '@/features/message/message.interface'
import { useAuth } from '@/hooks/useAuth'
import { getSocketIO } from '@/utils/socket'
import { useQueryClient } from '@tanstack/react-query'
import { produce } from 'immer'
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  IGroup,
  IGroupWithLastMessage,
  IPaginatedInfiniteGroups,
} from '../group.interface'

export const useGroupSocketHandle = () => {
  const { auth } = useAuth()
  const params = useParams()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  useEffect(() => {
    if (!auth) return

    const socket = getSocketIO()

    function updateGroupList(
      dataUpdater: (data: IPaginatedInfiniteGroups) => IPaginatedInfiniteGroups,
    ) {
      queryClient.setQueryData<IPaginatedInfiniteGroups>(
        ['userGroups', auth],
        data => {
          if (!data) return
          return dataUpdater(data)
        },
      )
    }

    function handleNewGroup(group: IGroup) {
      updateGroupList(data => {
        const updatedData = produce(data, draft => {
          draft.pages[0].data.unshift({
            ...group,
            lastActivity: group.createdAt,
            unreadCount: 0,
          })
        })
        return updatedData
      })
    }

    function handleNewMessage(message: IMessage & { groupName: string }) {
      updateGroupList(data => {
        const updatedData = produce(data, draft => {
          let messageGroup: IGroupWithLastMessage | undefined

          draft.pages.forEach(page => {
            const groupIndex = page.data.findIndex(
              group => group.id === message.groupId,
            )
            if (groupIndex !== -1) {
              messageGroup = page.data[groupIndex]
              page.data.splice(groupIndex, 1)
            }
          })

          const group: IGroupWithLastMessage = {
            id: messageGroup?.id || message.groupId,
            name: messageGroup?.name || message.groupName,
            lastActivity: message.createdAt,
            unreadCount: messageGroup?.unreadCount || 0,
            lastMessage: {
              id: message.id,
              content: message.content,
              senderId: message.senderId,
            },
          }

          if (params.groupId === message.groupId.toString()) {
            socket.emit('markMessageAsRead', message.id)
          } else {
            group.unreadCount++
          }
          draft.pages[0].data.unshift(group)
        })
        return updatedData
      })
    }

    function handleGroupMarkedAsRead(groupId: number) {
      updateGroupList(data => {
        const updatedData = produce(data, draft => {
          draft.pages.forEach(page => {
            const group = page.data.find(group => group.id === groupId)
            if (group) {
              group.unreadCount = 0
            }
          })
        })
        return updatedData
      })
    }

    const deleteGroupEntry = (
      data: IPaginatedInfiniteGroups,
      groupId: number,
    ) => {
      const updatedData = produce(data, draft =>
        draft.pages.forEach(page => {
          const groupIndex = page.data.findIndex(group => group.id === groupId)
          if (groupIndex !== -1) {
            page.data.splice(groupIndex, 1)
          }
        }),
      )
      if (params.groupId === groupId.toString()) {
        navigate('/chat', { replace: true })
      }
      return updatedData
    }

    function handleDeleteGroup(groupId: number) {
      updateGroupList(data => deleteGroupEntry(data, groupId))
    }

    function handleMemberLeft({
      groupId,
      memberId,
    }: {
      groupId: number
      memberId: number
    }) {
      updateGroupList(data => {
        if (auth?.id === memberId) {
          return deleteGroupEntry(data, groupId)
        }
        return data
      })
    }

    socket.on('newGroup', handleNewGroup)
    socket.on('newMessage', handleNewMessage)
    socket.on('groupMarkedAsRead', handleGroupMarkedAsRead)
    socket.on('groupDeleted', handleDeleteGroup)
    socket.on('memberLeft', handleMemberLeft)

    return () => {
      socket.off('newGroup', handleNewGroup)
      socket.off('newMessage', handleNewMessage)
      socket.off('groupMarkedAsRead', handleGroupMarkedAsRead)
      socket.off('groupDeleted', handleDeleteGroup)
      socket.off('memberLeft', handleMemberLeft)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth, params.groupId])
}
