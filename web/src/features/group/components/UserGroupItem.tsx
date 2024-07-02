import { NavLink } from 'react-router-dom'
import { cn } from '../../../utils/style'
import { IGroup } from '../group.interface'

interface UserGroupItemProps {
  group: IGroup
}

export const UserGroupItem = ({ group }: UserGroupItemProps) => {
  return (
    <NavLink
      to={`/chat/${group.id}`}
      className={({ isActive }) =>
        cn('border-b p-4 hover:bg-slate-100', isActive ? 'bg-gray-300' : '')
      }
    >
      <b className='font-semibold'>{group.name}</b>
    </NavLink>
  )
}
