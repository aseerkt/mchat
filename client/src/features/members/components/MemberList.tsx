import { Skeleton } from '../../../components/Skeleton'
import { useQuery } from '../../../hooks/useQuery'
import { Member } from '../../../interfaces/member.inteface'
import { MemberItem } from './MemberItem'

export const MemberList = ({ roomId }: { roomId: string }) => {
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
      <MemberItem key={member.user._id} member={member} />
    ))
  }

  return <ul className='flex flex-col gap-2 p-3'>{content}</ul>
}
