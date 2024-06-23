import backArrow from '../../../assets/back-svgrepo-com.svg'
import { Skeleton } from '../../../components/Skeleton'
import { useQuery } from '../../../hooks/useQuery'
import { Member } from '../../../interfaces/member.inteface'
import { cn } from '../../../utils/style'

interface MembersListProps {
  isOpen: boolean
  onClose: () => void
  roomId: string
}

export const MembersSidebar = (props: MembersListProps) => {
  return props.isOpen ? (
    <div className='w-full border-l md:w-[290px]'>
      <header className='flex h-14 items-center border-b px-4'>
        <button
          onClick={props.onClose}
          aria-label='close member drawer'
          className='mr-4 inline-flex shrink-0 md:hidden'
        >
          <img
            className='h-4 w-4'
            src={backArrow}
            alt='back-arrow'
            height={20}
            width={20}
          />
        </button>
        <h3>Members</h3>
      </header>
      <MemberList key={props.isOpen ? 'true' : 'false'} {...props} />
    </div>
  ) : null
}

const MemberList = ({ roomId }: { roomId: string }) => {
  const {
    data: members,
    loading,
    error,
  } = useQuery<Member[]>(`/api/rooms/${roomId}/members`)

  let content
  if (error) {
    return <div className='text-red-500'>{error.message}</div>
  } else if (loading) {
    content = new Array(5).map((_, idx) => (
      <Skeleton key={idx} className='h-6 w-full' />
    ))
  } else if (members?.length) {
    content = members.map(member => (
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
    ))
  }

  return <ul className='flex flex-col gap-2 p-3'>{content}</ul>
}
