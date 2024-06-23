import { Outlet, useParams } from 'react-router-dom'
import { PageLoader } from '../components/PageLoader'
import { ChatHeader, RoomList } from '../features/chat/components'
import { ChatUser } from '../features/chat/components/ChatUser'
import { CreateRoom } from '../features/chat/components/CreateRoom'
import { JoinRooms } from '../features/chat/components/JoinRoom'
import { useSocketConnect } from '../hooks/useSocketConnect'
import { cn } from '../utils/style'

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
            'flex w-full flex-shrink-0 flex-col md:w-[290px] md:border-r-2',
            params.roomId && 'hidden md:flex',
          )}
        >
          <ChatUser isConnected={isConnected} />
          <RoomList />
          <div className='flex shrink-0 gap-3 border-t px-3 py-4'>
            <JoinRooms />
            <CreateRoom />
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
