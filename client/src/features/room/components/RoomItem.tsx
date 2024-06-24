import { NavLink } from 'react-router-dom'
import { IRoom } from '../../../interfaces/room.interface'
import { cn } from '../../../utils/style'

interface RoomItemProps {
  room: IRoom
}

export const RoomItem = ({ room }: RoomItemProps) => {
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
