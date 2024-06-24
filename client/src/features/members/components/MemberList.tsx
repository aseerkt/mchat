import { useEffect } from 'react'
import { Skeleton } from '../../../components/Skeleton'
import { useQuery } from '../../../hooks/useQuery'
import { IMember } from '../../../interfaces/member.inteface'
import { getSocketIO } from '../../../utils/socket'
import { MemberItem } from './MemberItem'

export const MemberList = ({ roomId }: { roomId: string }) => {
  const {
    data: members,
    setData: setMembers,
    loading,
    error,
  } = useQuery<IMember[]>(`/api/rooms/${roomId}/members`)

  function setUserOnlineStatus(userId: string, online: boolean) {
    const memberIndex = members!.findIndex(m => m.user._id === userId)

    if (memberIndex !== -1) {
      setMembers(members =>
        members!.map((member, index) =>
          index === memberIndex ? { ...member, online } : member,
        ),
      )
    }
  }

  useEffect(() => {
    const socket = getSocketIO()

    function handleNewMember(member: IMember) {
      setMembers(members => [...(members || []), { ...member, online: true }])
    }

    function handleOnlineUser(userId: string) {
      setUserOnlineStatus(userId, true)
    }

    function handleOfflineUser(userId: string) {
      setUserOnlineStatus(userId, false)
    }

    socket.on('newMember', handleNewMember)
    if (members && members.length > 1) {
      socket.on('userOnline', handleOnlineUser)
      socket.on('userOffline', handleOfflineUser)
    }
    return () => {
      socket.off('newMember', handleNewMember)
      socket.off('userOnline', handleOnlineUser)
      socket.off('userOffline', handleOfflineUser)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [members])

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

  return (
    <ul className='flex h-full flex-col gap-2 overflow-y-auto p-3'>
      {content}
    </ul>
  )
}
