import { Skeleton } from '../../../components/Skeleton'
import { useAuthState } from '../../../hooks/useAuth'
import { useQuery } from '../../../hooks/useQuery'
import { Room } from '../../../interfaces/room.interface'
import { RoomItem } from './RoomItem'

export const RoomList = () => {
  const auth = useAuthState()
  const {
    data: rooms,
    loading,
    error,
  } = useQuery<Room[]>(auth?._id ? `/api/users/${auth._id}/rooms` : '')

  let content

  if (error) {
    content = <p className='text-red-500'>{error.message}</p>
  } else if (loading) {
    content = new Array(5).map((_, idx) => (
      <Skeleton key={idx} className='h-8 w-full' />
    ))
  } else if (rooms?.length) {
    content = rooms?.map(room => <RoomItem key={room._id} room={room} />)
  } else if (Array.isArray(rooms)) {
    content = <p className='p-3 text-gray-700'>Join or create room</p>
  }

  return (
    <aside className='flex h-full flex-1 flex-col overflow-y-auto'>
      {content}
    </aside>
  )
}
