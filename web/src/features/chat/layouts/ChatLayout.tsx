import { PageLoader } from '@/components/PageLoader'
import { ChatHeader } from '@/features/chat/components'
import { ChatUser } from '@/features/chat/components/ChatUser'
import {
  CreateGroup,
  JoinGroup,
  UserGroupList,
} from '@/features/group/components'
import { useSocketConnect } from '@/hooks/useSocketConnect'
import { cn } from '@/utils/style'
import { Outlet, useParams } from 'react-router-dom'

const ChatLayout = () => {
  const { isConnected } = useSocketConnect()
  const params = useParams()

  if (!isConnected) {
    return <PageLoader />
  }

  return (
    <div className='flex h-screen w-screen flex-col overflow-hidden'>
      <ChatHeader />
      <div className='flex flex-1 overflow-hidden'>
        <div
          className={cn(
            'flex w-full flex-shrink-0 flex-col md:w-[280px] md:border-r-2',
            params.groupId && 'hidden md:flex',
          )}
        >
          <ChatUser isConnected={isConnected} />
          <UserGroupList />
          <div className='flex shrink-0 justify-center gap-3 border-t px-3 py-4'>
            <JoinGroup />
            <CreateGroup />
          </div>
        </div>
        <div className='flex h-full flex-1 overflow-hidden'>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default ChatLayout
