import { PageLoader } from '@/components/PageLoader'
import { Header } from '@/features/chat/components'
import { ChatUser } from '@/features/chat/components/ChatUser'
import {
  CreateGroup,
  JoinGroup,
  UserGroupList,
} from '@/features/group/components'
import { CreateDM } from '@/features/message/components/CreateDM'
import { useSocketConnect } from '@/hooks/useSocketConnect'
import { cn } from '@/utils/style'
import { Outlet, useParams } from 'react-router-dom'

const ChatScrollArea = ({ children }: { children: React.ReactNode }) => {
  const params = useParams()

  return (
    <div
      className={cn(
        'flex w-full flex-shrink-0 flex-col md:w-[280px] md:border-r-2',
        (params.groupId || params.partnerId) && 'hidden md:flex',
      )}
    >
      {children}
    </div>
  )
}

export const Component = () => {
  const { isConnected } = useSocketConnect()

  if (!isConnected) {
    return <PageLoader />
  }

  return (
    <div className='flex h-screen w-screen flex-col overflow-hidden'>
      <Header />
      <div className='flex flex-1 overflow-hidden'>
        <ChatScrollArea>
          <ChatUser isConnected={isConnected} />
          <UserGroupList />
          <div className='flex shrink-0 flex-wrap justify-center gap-3 border-t px-3 py-4'>
            <JoinGroup />
            <CreateGroup />
            <CreateDM />
          </div>
        </ChatScrollArea>
        <div className='flex h-full flex-1 overflow-hidden'>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

Component.displayName = 'ChatLayout'
