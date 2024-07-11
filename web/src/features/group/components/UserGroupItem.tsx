import { Avatar } from '@/components/Avatar'
import { formatGroupDate } from '@/utils/date'
import { cn } from '@/utils/style'
import { NavLink } from 'react-router-dom'
import { IGroupWithLastMessage } from '../group.interface'

interface UserGroupItemProps {
  group: IGroupWithLastMessage
}

export const UserGroupItem = ({ group }: UserGroupItemProps) => {
  return (
    <NavLink
      to={`/chat/${group.id}`}
      className={({ isActive }) =>
        cn('border-b p-4 hover:bg-slate-100', isActive ? 'bg-gray-300' : '')
      }
    >
      <div className='flex justify-between'>
        <Avatar name={group.name} id={group.id} />
        <div className='ml-3 flex flex-1 flex-col overflow-hidden'>
          <b
            className='text-ellipsis whitespace-nowrap text-nowrap font-semibold'
            title={group.name}
          >
            {group.name}
          </b>
          <span className='w-[95%] overflow-hidden text-ellipsis whitespace-nowrap text-nowrap text-xs text-gray-500'>
            {group.lastMessage?.content}
          </span>
        </div>
        <div className='flex flex-col'>
          <span className='text-xs text-gray-500'>
            {formatGroupDate(group.lastActivity)}
          </span>
        </div>
      </div>
    </NavLink>
  )
}
