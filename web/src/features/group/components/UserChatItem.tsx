import { Avatar } from '@/components/Avatar'
import { formatGroupDate } from '@/utils/date'
import { cn } from '@/utils/style'
import { NavLink } from 'react-router-dom'
import { IChat } from '../group.interface'

interface UserChatItemProps {
  chat: IChat
}

export const UserChatItem = ({ chat }: UserChatItemProps) => {
  return (
    <NavLink
      to={`/chat/${chat.groupId ? 'group' : 'direct'}/${chat.groupId || chat.receiverId}`}
      className={({ isActive }) =>
        cn('border-b p-4 hover:bg-slate-100', isActive ? 'bg-gray-300' : '')
      }
    >
      <div className='flex justify-between'>
        <Avatar name={chat.chatName} id={chat.groupId! || chat.receiverId!} />
        <div className='ml-3 flex flex-1 flex-col overflow-hidden'>
          <b
            className='overflow-hidden text-ellipsis whitespace-nowrap text-nowrap font-semibold'
            title={chat.chatName}
          >
            {chat.chatName}
          </b>
          <span className='w-[95%] overflow-hidden text-ellipsis whitespace-nowrap text-nowrap text-xs text-gray-500'>
            {chat.lastMessage?.content}
          </span>
        </div>
        <div className='flex flex-col items-end'>
          <span
            className={cn(
              'text-xs text-gray-500',
              chat.unreadCount > 0 ? 'text-green-600' : 'text-gray-500',
            )}
          >
            {formatGroupDate(chat.lastActivity)}
          </span>
          <span
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded-full text-center text-xs text-white',
              chat.unreadCount > 0 ? 'bg-green-600' : 'hidden',
            )}
          >
            {chat.unreadCount}
          </span>
        </div>
      </div>
    </NavLink>
  )
}
