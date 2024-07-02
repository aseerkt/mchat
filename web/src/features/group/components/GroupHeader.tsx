import backArrow from '@/assets/back-svgrepo-com.svg'
import usersSvg from '@/assets/users-svgrepo-com.svg'
import { Skeleton } from '@/components/Skeleton'
import { useQuery } from '@tanstack/react-query'
import { NavLink } from 'react-router-dom'
import { fetchGroup } from '../group.service'

interface GroupHeaderProps {
  groupId: number
  showMembers: () => void
}

export const GroupHeader = ({ groupId, showMembers }: GroupHeaderProps) => {
  const {
    data: group,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['currentGroup', groupId],
    queryFn: ({ queryKey }) => fetchGroup(queryKey[1] as number),
  })

  let content

  if (isLoading) {
    content = <Skeleton className='h-5 w-28' />
  } else if (group?.id) {
    content = (
      <>
        <h3 className='text-lg font-bold'>{group.name}</h3>
        <button onClick={showMembers} className='ml-auto'>
          <img src={usersSvg} alt='open member drawer' height={24} width={24} />
        </button>
      </>
    )
  } else if (error) {
    content = <div>Unable to fetch group</div>
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
