import backArrow from '@/assets/back-svgrepo-com.svg'
import usersSvg from '@/assets/users-svgrepo-com.svg'
import { Alert } from '@/components/Alert'
import { NavLink } from 'react-router-dom'

interface ChatHeaderProps {
  error: Error | null
  chatId?: number
  chatName?: string
  toggleGroupInfo?: () => void
}

export const ChatHeader = ({
  error,
  chatId,
  chatName,
  toggleGroupInfo,
}: ChatHeaderProps) => {
  let content

  if (chatId) {
    content = (
      <>
        <h3 className='text-lg font-bold'>{chatName}</h3>
        {toggleGroupInfo && (
          <button onClick={toggleGroupInfo} className='ml-auto'>
            <img
              src={usersSvg}
              alt='open member drawer'
              height={24}
              width={24}
            />
          </button>
        )}
      </>
    )
  } else if (error) {
    content = (
      <Alert severity='error' size='sm'>
        Unable to fetch chat
      </Alert>
    )
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
