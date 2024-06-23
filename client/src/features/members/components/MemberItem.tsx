import { Member } from '../../../interfaces/member.inteface'
import { cn } from '../../../utils/style'

interface MemberItemProps {
  member: Member
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
          member.online ? 'bg-green-800' : 'bg-gray-500',
        )}
      ></div>
      <b>{member.user.username}</b>
    </li>
  )
}
