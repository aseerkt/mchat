import { useQuery } from '../../../hooks/useQuery'
import { Room } from '../../../interfaces/room.interface'

interface RoomHeaderProps {
  roomId: string
}

export const RoomHeader = ({ roomId }: RoomHeaderProps) => {
  const { data: room, loading, error } = useQuery<Room>(`/api/rooms/${roomId}`)

  let content

  if (loading) {
    content = <div>Loading...</div>
  } else if (room?._id) {
    content = <h3 className='text-lg font-bold'>{room.name}</h3>
  } else if (error) {
    content = <div>Unable to fetch room metadata</div>
  }

  return (
    <header className='flex h-14 w-full shrink-0 items-center border-b px-4'>
      {content}
    </header>
  )
}
