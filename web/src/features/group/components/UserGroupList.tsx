import { Skeleton } from '@/components/Skeleton'
import { IMessage } from '@/features/message/message.interface'
import { useAuth } from '@/hooks/useAuth'
import { useInView } from '@/hooks/useInView'
import { getSocketIO } from '@/utils/socket'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { produce } from 'immer'
import { Fragment, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import {
  IGroup,
  IGroupWithLastMessage,
  IPaginatedInfiniteGroups,
} from '../group.interface'
import { fetchUserGroups } from '../group.service'
import { UserGroupItem } from './UserGroupItem'

export const UserGroupList = () => {
  const { auth } = useAuth()
  const queryClient = useQueryClient()
  const params = useParams()
  const { data, isLoading, isSuccess, hasNextPage, fetchNextPage, error } =
    useInfiniteQuery({
      queryKey: ['userGroups', auth],
      queryFn: async ({ pageParam }) => {
        return fetchUserGroups({
          userId: auth!.id,
          limit: 15,
          cursor: pageParam,
        })
      },
      initialPageParam: null as number | null,
      getNextPageParam(lastPage) {
        return lastPage.cursor ? lastPage.cursor : undefined
      },
      enabled: Boolean(auth?.id),
    })

  const listRef = useRef<HTMLUListElement>(null)

  const watchElement = useInView(listRef, fetchNextPage, hasNextPage)

  useEffect(() => {
    if (!auth) return

    const socket = getSocketIO()

    function handleNewGroup(group: IGroup) {
      queryClient.setQueryData<IPaginatedInfiniteGroups>(
        ['userGroups', auth],
        data => {
          if (!data) return
          const updatedData = produce(data, draft => {
            draft.pages[0].data.unshift({
              ...group,
              lastActivity: group.createdAt,
              unreadCount: 0,
            })
          })
          return updatedData
        },
      )
    }

    function handleNewMessage(message: IMessage) {
      queryClient.setQueryData<IPaginatedInfiniteGroups>(
        ['userGroups', auth],
        data => {
          if (!data) return
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

            if (messageGroup) {
              messageGroup.lastMessage = {
                id: message.id,
                content: message.content,
                senderId: message.senderId,
              }
              messageGroup.lastActivity = message.createdAt
              if (params.groupId === message.groupId.toString()) {
                socket.emit('markMessageAsRead', message.id)
              } else {
                messageGroup.unreadCount++
              }
              draft.pages[0].data.unshift(messageGroup)
            }
          })
          return updatedData
        },
      )
    }

    function handleGroupMarkedAsRead(groupId: number) {
      queryClient.setQueryData<IPaginatedInfiniteGroups>(
        ['userGroups', auth],
        data => {
          if (!data) return
          const updatedData = produce(data, draft => {
            draft.pages.forEach(page => {
              const group = page.data.find(group => group.id === groupId)
              if (group) {
                group.unreadCount = 0
              }
            })
          })
          return updatedData
        },
      )
    }

    socket.on('newGroup', handleNewGroup)
    socket.on('newMessage', handleNewMessage)
    socket.on('groupMarkedAsRead', handleGroupMarkedAsRead)

    return () => {
      socket.off('newGroup', handleNewGroup)
      socket.off('newMessage', handleNewMessage)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth, params.groupId])

  let content

  if (error) {
    content = <p className='text-red-500'>{error.message}</p>
  } else if (isLoading) {
    content = new Array(5).map((_, idx) => (
      <Skeleton key={idx} className='h-8 w-full' />
    ))
  } else if (data?.pages[0].data.length) {
    content = (
      <ul ref={listRef} className='flex h-full flex-col overflow-y-auto'>
        {data.pages.map((page, i) => (
          <Fragment key={i}>
            {page.data.map(group => (
              <UserGroupItem key={group.id} group={group} />
            ))}
          </Fragment>
        ))}
        {watchElement}
      </ul>
    )
  } else if (isSuccess) {
    content = <p className='p-3 text-gray-700'>Join or create group</p>
  }

  return <aside className='flex-1 overflow-hidden'>{content}</aside>
}
