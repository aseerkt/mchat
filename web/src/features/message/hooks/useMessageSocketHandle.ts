import { useAuth } from '@/hooks/useAuth'
import { getSocketIO } from '@/utils/socket'
import { useQueryClient } from '@tanstack/react-query'
import { produce } from 'immer'
import { useEffect } from 'react'
import { IMessage, TMessageInfiniteData } from '../message.interface'

export const useMessageSocketHandle = ({
  groupId,
  partnerId,
  afterNewMessage,
}: {
  groupId?: number
  partnerId?: number
  afterNewMessage: () => void
}) => {
  const queryClient = useQueryClient()
  const { auth } = useAuth()
  useEffect(() => {
    const socket = getSocketIO()

    function updateMessageList(
      updater: (data: TMessageInfiniteData) => TMessageInfiniteData,
    ) {
      queryClient.setQueryData<TMessageInfiniteData>(
        ['messages', { groupId, partnerId }],
        data => {
          if (!data) return

          return updater(data)
        },
      )
    }

    function handleNewMessage(message: IMessage) {
      // check whether message belongs to current group
      if (groupId && message.groupId !== groupId) {
        return
      }
      // check whether message belongs to current dm
      if (
        partnerId &&
        ![message.senderId, message.receiverId].includes(partnerId)
      ) {
        return
      }

      updateMessageList(data => {
        return produce(data, draft => {
          draft.pages[0].data.unshift(message)
        })
      })
      afterNewMessage()

      if (
        message.receiverId === auth?.id ||
        (groupId &&
          message.groupId === groupId &&
          message.senderId !== auth?.id)
      ) {
        socket.emit('markMessageAsRead', message.id)
      }
    }

    function handleMessageDelete(messageId: number) {
      updateMessageList(data => {
        return produce(data, draft => {
          draft.pages.forEach(page => {
            page.data.forEach(message => {
              if (message.id === messageId) {
                message.isDeleted = true
                message.content = 'this message has been deleted'
              }
            })
          })
        })
      })
    }

    socket.on('newMessage', handleNewMessage)
    socket.on('messageDeleted', handleMessageDelete)
    return () => {
      socket.off('newMessage', handleNewMessage)
      socket.off('messageDeleted', handleMessageDelete)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, partnerId])
}
