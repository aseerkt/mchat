import backArrow from '@/assets/back-svgrepo-com.svg'
import { Alert } from '@/components/Alert'
import { Dialog } from '@/components/Dialog'
import { MediaCaller } from '@/features/webrtc/components'
import { useDisclosure } from '@/hooks/useDisclosure'
import { Phone, Users } from 'lucide-react'
import { NavLink } from 'react-router-dom'

interface ChatHeaderProps {
  error: Error | null
  chatId?: number
  chatName?: string
  toggleGroupInfo?: () => void
  chatType: 'group' | 'dm'
}

export const ChatHeader = ({
  error,
  chatId,
  chatName,
  chatType,
  toggleGroupInfo,
}: ChatHeaderProps) => {
  const { isOpen: isMediaCallerOpen, toggle: toggleMediaCaller } =
    useDisclosure()

  let content

  if (chatId) {
    content = (
      <>
        <h3 className='text-lg font-bold'>{chatName}</h3>
        <div className='ml-auto flex items-center gap-4'>
          {chatType === 'group' && (
            <>
              <button
                onClick={toggleMediaCaller}
                aria-label='open media caller'
              >
                <Phone />
              </button>
              <Dialog isOpen={isMediaCallerOpen} onClose={toggleMediaCaller}>
                <MediaCaller onCancel={toggleMediaCaller} />
              </Dialog>
            </>
          )}
          {toggleGroupInfo && (
            <button onClick={toggleGroupInfo}>
              <Users />
            </button>
          )}
        </div>
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
