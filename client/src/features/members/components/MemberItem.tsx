import { IMember } from '../../../interfaces/member.inteface'
import { cn } from '../../../utils/style'

interface MemberItemProps {
  member: IMember
}

export const MemberItem = ({ member }: MemberItemProps) => {
  return (
    <li
      className='inline-flex items-center gap-2 bg-gray-100 p-3'
      key={member.user._id}
    >
      <div
        className={cn(
          'h-3 w-3 rounded-full',
          member.online
            ? 'bg-green-600'
            : 'border-2 border-gray-400 bg-gray-200',
        )}
      ></div>
      <b>{member.user.username}</b>
    </li>
  )
}
