import { cn } from '@/utils/style'
import { IMember } from '../member.interface'

interface MemberItemProps {
  member: IMember
  onClick: () => void
}

export const MemberItem = ({ member, onClick }: MemberItemProps) => {
  return (
    <li
      role='button'
      className='inline-flex cursor-pointer items-center bg-gray-100 p-3 hover:bg-gray-200'
      key={member.userId}
      onClick={onClick}
    >
      <div
        aria-label={member.online ? 'user online' : 'user offline'}
        className={cn(
          'mr-2 h-3 w-3 shrink-0 rounded-full',
          member.online
            ? 'bg-green-600'
            : 'border-2 border-gray-400 bg-gray-200',
        )}
      ></div>
      <b
        title={member.username}
        className='overflow-hidden text-ellipsis whitespace-nowrap text-sm'
      >
        {member.username}
      </b>
      {member.role !== 'member' && (
        <span className='ml-auto rounded-full border-2 bg-yellow-700 px-2 text-xs font-semibold text-blue-50'>
          {member.role}
        </span>
      )}
    </li>
  )
}
