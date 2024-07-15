import { Skeleton } from '@/components/Skeleton'
import { useInView } from '@/hooks/useInView'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Fragment, useRef, useState } from 'react'
import { useMemberSocketHandle } from '../hooks/useMemberSocketHandle'
import { fetchGroupMembers } from '../member.service'
import { MemberItem } from './MemberItem'
import { MemberModal } from './MemberModal'

export const MemberList = ({ groupId }: { groupId: number }) => {
  const listRef = useRef<HTMLUListElement>(null)

  const { data, hasNextPage, fetchNextPage, isLoading, error } =
    useInfiniteQuery({
      queryKey: ['members', groupId],
      queryFn: ({ queryKey, pageParam }) =>
        fetchGroupMembers({
          groupId: queryKey[1] as number,
          limit: 15,
          cursor: pageParam,
        }),
      initialPageParam: null as string | null,
      getNextPageParam: lastPage =>
        lastPage.cursor ? lastPage.cursor : undefined,
    })

  const watchElement = useInView(listRef, fetchNextPage, hasNextPage)

  useMemberSocketHandle(groupId)

  const [selectedMemberId, setSelectedMemberId] = useState<number>()

  const openMemberModal = (userId: number) => () => setSelectedMemberId(userId)
  const closeMemberModal = () => setSelectedMemberId(undefined)

  let content

  if (error) {
    return <div className='text-red-500'>{error.message}</div>
  } else if (isLoading) {
    content = new Array(5).map((_, idx) => (
      <Skeleton key={idx} className='h-6 w-full' />
    ))
  } else if (data?.pages[0].data.length) {
    content = (
      <>
        {data.pages.map((page, i) => (
          <Fragment key={i}>
            {page.data.map(member => (
              <MemberItem
                key={member.id}
                member={member}
                onClick={openMemberModal(member.userId)}
              />
            ))}
          </Fragment>
        ))}
        <MemberModal
          groupId={groupId}
          userId={selectedMemberId}
          onClose={closeMemberModal}
        />
      </>
    )
  }

  return (
    <div className='flex flex-1 flex-col overflow-hidden'>
      <div className='mb-3 shrink-0 border-b p-3'>
        <h4 className='font-semibold'>Members</h4>
      </div>
      <ul
        ref={listRef}
        className='flex h-full flex-col gap-2 overflow-y-auto px-3'
      >
        {content}
        {watchElement}
      </ul>
    </div>
  )
}
