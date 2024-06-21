import { Outlet } from 'react-router-dom'
import { PageLoader } from '../components/PageLoader'
import { ChatHeader, RoomList } from '../features/chat/components'
import { ChatUser } from '../features/chat/components/ChatUser'
import { useSocketConnect } from '../hooks/useSocketConnect'

const ChatLayout = () => {
  const { isConnected } = useSocketConnect()

  if (!isConnected) {
    return <PageLoader />
  }

  return (
    <div className='flex h-screen w-screen flex-col overflow-hidden'>
      <ChatHeader />
      <div className='flex flex-1 overflow-hidden'>
        <div className='flex flex-col border-r-2'>
          <ChatUser isConnected={isConnected} />
          <RoomList />
        </div>
        <div className='flex h-full flex-1 flex-col overflow-hidden'>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default ChatLayout
