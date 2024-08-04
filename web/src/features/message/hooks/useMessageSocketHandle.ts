import { useAuth } from '@/hooks/useAuth'
import { useDisclosure } from '@/hooks/useDisclosure'
import { getSocketIO } from '@/utils/socket'
import { useQueryClient } from '@tanstack/react-query'
import { produce } from 'immer'
import { useEffect } from 'react'
import { IMessage, TMessageInfiniteData } from '../message.interface'

const MESSAGE_LIST_OFFSET = -200

export const useMessageSocketHandle = ({
  groupId,
  partnerId,
  listRef,
}: {
  groupId?: number
  partnerId?: number
  listRef: React.RefObject<HTMLUListElement>
}) => {
  const queryClient = useQueryClient()

  const scrollToBottom = () => {
    listRef.current?.scrollTo(0, listRef.current?.scrollHeight)
  }

  
  const {
    isOpen: hasNewMessage,
    open: showNewMessageBtn,
    close: hideNewMessageBtn,
  } = useDisclosure()

  function handleListScroll() {
    if (listRef.current!.scrollTop > MESSAGE_LIST_OFFSET && hasNewMessage) {
      hideNewMessageBtn()
    }
  }
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

      if (
        message.senderId === auth?.id ||
        listRef.current!.scrollTop > MESSAGE_LIST_OFFSET
      ) {
        setTimeout(scrollToBottom, 100)
      } else if (!hasNewMessage) {
        showNewMessageBtn()
      }

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

  return {
    hasNewMessage,
    scrollToBottom,
    handleListScroll,
  }
}
