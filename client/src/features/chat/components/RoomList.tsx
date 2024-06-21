import { useQuery } from '../../../hooks/useQuery'
import { Room } from '../../../interfaces/room.interface'
import { RoomItem } from './RoomItem'

export const RoomList = () => {
  const { data: rooms } = useQuery<Room[]>('/api/rooms')

  return (
    <aside className='flex h-full w-[290px] flex-1 flex-col overflow-y-auto pb-14'>
      {rooms?.map(room => <RoomItem key={room._id} room={room} />)}
    </aside>
  )
}
