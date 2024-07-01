import backArrow from '@/assets/back-svgrepo-com.svg'
import usersSvg from '@/assets/users-svgrepo-com.svg'
import { Skeleton } from '@/components/Skeleton'
import { useQuery } from '@tanstack/react-query'
import { NavLink } from 'react-router-dom'
import { fetchRoom } from '../group.service'

interface RoomHeaderProps {
  groupId: number
  showMembers: () => void
}

export const RoomHeader = ({ groupId, showMembers }: RoomHeaderProps) => {
  const {
    data: room,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['currentRoom', groupId],
    queryFn: ({ queryKey }) => fetchRoom(queryKey[1]),
  })

  let content

  if (isLoading) {
    content = <Skeleton className='h-5 w-28' />
  } else if (room?.id) {
    content = (
      <>
        <h3 className='text-lg font-bold'>{room.name}</h3>
        <button onClick={showMembers} className='ml-auto'>
          <img src={usersSvg} alt='open member drawer' height={24} width={24} />
        </button>
      </>
    )
  } else if (error) {
    content = <div>Unable to fetch room metadata</div>
  }

  return (
    <header className='flex h-14 w-full shrink-0 items-center border-b px-4'>
      <NavLink
        aria-label='back to groups'
        className='mr-4 inline-flex flex-shrink-0 md:hidden'
        to={'/chat'}
      >
        <img className='h-4 w-4' src={backArrow} alt='back-arrow' />
      </NavLink>
      {content}
    </header>
  )
}
