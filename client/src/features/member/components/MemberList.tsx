import { Skeleton } from '@/components/Skeleton'
import { useInView } from '@/hooks/useInView'
import { IPaginatedResult } from '@/interfaces/common.interface'
import { getSocketIO } from '@/utils/socket'
import {
  InfiniteData,
  Updater,
  useInfiniteQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { produce } from 'immer'
import { Fragment, useEffect, useRef } from 'react'
import { IMember } from '../member.interface'
import { fetchRoomMembers } from '../member.service'
import { MemberItem } from './MemberItem'

type MemberInfiniteData = InfiniteData<IPaginatedResult<IMember>, string>

type MemberUpdater = Updater<
  MemberInfiniteData | undefined,
  MemberInfiniteData | undefined
>

export const MemberList = ({ roomId }: { roomId: string }) => {
  const listRef = useRef<HTMLUListElement>(null)
  const queryClient = useQueryClient()

  const { data, hasNextPage, fetchNextPage, isLoading, error } =
    useInfiniteQuery({
      queryKey: ['members', roomId],
      queryFn: ({ queryKey, pageParam }) =>
        fetchRoomMembers({ roomId: queryKey[1], limit: 15, cursor: pageParam }),
      initialPageParam: '',
      getNextPageParam: lastPage =>
        lastPage.cursor ? lastPage.cursor : undefined,
    })

  const watchElement = useInView(listRef, fetchNextPage, hasNextPage)

  const updateMemberData = (updater: MemberUpdater) => {
    queryClient.setQueriesData({ queryKey: ['members', roomId] }, updater)
  }

  useEffect(() => {
    const socket = getSocketIO()

    function setUserOnlineStatus(userId: string, online: boolean) {
      updateMemberData(data => {
        if (!data) {
          return data
        }
        const updatedData = produce(data, draft => {
          let member: IMember | undefined
          draft.pages.forEach(page => {
            page.data.forEach(m => {
              if (m.user._id === userId) member = m
            })
          })
          console.log(member)
          if (member) {
            member.online = online
          }
        })
        return updatedData
      })
    }

    function handleNewMember(member: IMember) {
      updateMemberData(data => {
        if (!data) {
          return data
        }
        const updatedData = produce(data, draft => {
          draft.pages[0].data.unshift({ ...member, online: true })
        })
        return updatedData
      })
    }

    function handleOnlineUser(userId: string) {
      setUserOnlineStatus(userId, true)
    }

    function handleOfflineUser(userId: string) {
      setUserOnlineStatus(userId, false)
    }

    socket.on('newMember', handleNewMember)
    socket.on('userOnline', handleOnlineUser)
    socket.on('userOffline', handleOfflineUser)
    return () => {
      socket.off('newMember', handleNewMember)
      socket.off('userOnline', handleOnlineUser)
      socket.off('userOffline', handleOfflineUser)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  let content

  if (error) {
    return <div className='text-red-500'>{error.message}</div>
  } else if (isLoading) {
    content = new Array(5).map((_, idx) => (
      <Skeleton key={idx} className='h-6 w-full' />
    ))
  } else if (data?.pages?.length) {
    content = data.pages.map((page, i) => (
      <Fragment key={i}>
        {page.data.map(member => (
          <MemberItem key={member.user._id} member={member} />
        ))}
      </Fragment>
    ))
  }

  return (
    <ul
      ref={listRef}
      className='flex h-full flex-1 flex-col gap-2 overflow-y-auto p-3'
    >
      {content}
      {watchElement}
    </ul>
  )
}
