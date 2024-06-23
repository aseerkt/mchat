import { useAuthState } from '../../../hooks/useAuth'
import { useQuery } from '../../../hooks/useQuery'
import { Room } from '../../../interfaces/room.interface'
import { RoomItem } from './RoomItem'

export const RoomList = () => {
  const auth = useAuthState()
  const { data: rooms } = useQuery<Room[]>(`/api/users/${auth!._id}/rooms`)

  return (
    <aside className='flex h-full flex-1 flex-col overflow-y-auto py-3'>
      {rooms?.map(room => <RoomItem key={room._id} room={room} />)}
    </aside>
  )
}
