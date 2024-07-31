import { IMessage } from '@/features/message/message.interface'
import { useAuth } from '@/hooks/useAuth'
import { getSocketIO } from '@/utils/socket'
import { useQueryClient } from '@tanstack/react-query'
import { produce } from 'immer'
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { IChat, IGroup, IPaginatedInfiniteChats } from '../group.interface'

export const useChatSocketHandle = () => {
  const { auth } = useAuth()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const params = useParams()

  function getUnreadCount(checker: (chat: IChat) => boolean) {
    if (!auth) return 0
    const chatListData = queryClient.getQueryData<IPaginatedInfiniteChats>([
      'userGroups',
      auth,
    ])
    let unreadCount = 0
    chatListData?.pages.forEach(page =>
      page.data.forEach(chat => {
        if (checker(chat)) {
          unreadCount = chat.unreadCount
        }
      }),
    )
    return unreadCount
  }

  useEffect(() => {
    const partnerId = Number(params.partnerId)
    if (partnerId) {
      const socket = getSocketIO()
      socket.emit('joinDm', partnerId)

      const unreadCount = getUnreadCount(chat => chat.partnerId === partnerId)
      if (unreadCount) {
        socket.emit('markChatMessagesAsRead', { receiverId: partnerId })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.partnerId])

  useEffect(() => {
    const groupId = Number(params.groupId)
    if (groupId) {
      const socket = getSocketIO()
      socket.emit('joinGroup', groupId)
      const unreadCount = getUnreadCount(chat => chat.groupId === groupId)
      if (unreadCount) {
        socket.emit('markChatMessagesAsRead', { groupId })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.groupId])

  useEffect(() => {
    if (!auth) return

    const socket = getSocketIO()

    function updateChatList(
      dataUpdater: (data: IPaginatedInfiniteChats) => IPaginatedInfiniteChats,
    ) {
      queryClient.setQueryData<IPaginatedInfiniteChats>(
        ['userGroups', auth],
        data => {
          if (!data) return
          return dataUpdater(data)
        },
      )
    }

    function handleNewGroup(group: IGroup) {
      updateChatList(data => {
        const updatedData = produce(data, draft => {
          draft.pages[0].data.unshift({
            ...group,
            groupId: group.id,
            chatName: group.name,
            lastActivity: group.createdAt,
            unreadCount: 0,
          })
        })
        return updatedData
      })
    }

    function handleNewMessage(message: IMessage & { chatName: string }) {
      updateChatList(data => {
        return produce(data, draft => {
          let chat: IChat | undefined

          draft.pages.forEach(page => {
            const chatIndex = page.data.findIndex(chat =>
              message.groupId
                ? chat.groupId === message.groupId
                : chat.partnerId === message.receiverId ||
                  chat.partnerId === message.senderId,
            )
            if (chatIndex !== -1) {
              chat = page.data[chatIndex]
              page.data.splice(chatIndex, 1)
            }
          })

          const updatedChat: IChat = {
            groupId: chat?.groupId || message.groupId,
            partnerId:
              chat?.partnerId ||
              (message.receiverId === auth?.id
                ? message.senderId
                : message.receiverId),
            chatName: chat?.chatName || message.chatName,
            lastActivity: message.createdAt,
            unreadCount: chat?.unreadCount || 0,
            lastMessage: {
              messageId: message.id,
              content: message.content,
            },
          }

          // if not current chat increment unread count
          if (
            message.groupId?.toString() !== params.groupId ||
            updatedChat.partnerId?.toString() !== params.partnerId
          ) {
            updatedChat.unreadCount++
          }
          draft.pages[0].data.unshift(updatedChat)
        })
      })
    }

    function handleGroupMarkedAsRead({
      groupId,
      receiverId,
    }: {
      groupId?: number
      receiverId?: number
    }) {
      updateChatList(data => {
        return produce(data, draft => {
          draft.pages.forEach(page => {
            const chat = page.data.find(chat =>
              groupId
                ? chat.groupId === groupId
                : chat.partnerId === receiverId,
            )
            if (chat) {
              chat.unreadCount = 0
            }
          })
        })
      })
    }

    const deleteGroupEntry = (
      data: IPaginatedInfiniteChats,
      groupId: number,
    ) => {
      const updatedData = produce(data, draft =>
        draft.pages.forEach(page => {
          const groupIndex = page.data.findIndex(
            group => group.groupId === groupId,
          )
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
      updateChatList(data => deleteGroupEntry(data, groupId))
    }

    function handleMemberLeft({
      groupId,
      memberId,
    }: {
      groupId: number
      memberId: number
    }) {
      updateChatList(data => {
        if (auth?.id === memberId) {
          return deleteGroupEntry(data, groupId)
        }
        return data
      })
    }

    socket.on('newGroup', handleNewGroup)
    socket.on('newMessage', handleNewMessage)
    socket.on('chatMarkedAsRead', handleGroupMarkedAsRead)
    socket.on('groupDeleted', handleDeleteGroup)
    socket.on('memberLeft', handleMemberLeft)

    return () => {
      socket.off('newGroup', handleNewGroup)
      socket.off('newMessage', handleNewMessage)
      socket.off('chatMarkedAsRead', handleGroupMarkedAsRead)
      socket.off('groupDeleted', handleDeleteGroup)
      socket.off('memberLeft', handleMemberLeft)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth, params.groupId, params.partnerId])
}
