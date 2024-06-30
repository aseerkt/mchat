import { NavLink } from 'react-router-dom'
import { cn } from '../../../utils/style'
import { IRoom } from '../room.interface'

interface UserRoomItemProps {
  room: IRoom
}

export const UserRoomItem = ({ room }: UserRoomItemProps) => {
  return (
    <NavLink
      to={`/chat/${room._id}`}
      className={({ isActive }) =>
        cn('border-b p-4 hover:bg-slate-100', isActive ? 'bg-gray-300' : '')
      }
    >
      <b className='font-semibold'>{room.name}</b>
    </NavLink>
  )
}
