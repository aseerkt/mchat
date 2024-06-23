import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../../components/Button'
import { Dialog } from '../../../components/Dialog'
import { Skeleton } from '../../../components/Skeleton'
import { useAuthState } from '../../../hooks/useAuth'
import { useDisclosure } from '../../../hooks/useDisclosure'
import { useMutation } from '../../../hooks/useMutation'
import { useQuery } from '../../../hooks/useQuery'
import { useInvalidateQueryCache } from '../../../hooks/useQueryCache'
import { useToast } from '../../../hooks/useToast'
import { Member } from '../../../interfaces/member.inteface'
import { Room } from '../../../interfaces/room.interface'

export const JoinRooms = () => {
  const { isOpen, toggle } = useDisclosure()

  return (
    <>
      <Button className='min-w-fit' onClick={toggle}>
        Join Room
      </Button>
      <Dialog isOpen={isOpen} onClose={toggle}>
        <JoinRoomsForm onClose={toggle} />
      </Dialog>
    </>
  )
}

const JoinRoomsForm = ({ onClose }: { onClose: () => void }) => {
  const { toast } = useToast()
  const navigate = useNavigate()
  const auth = useAuthState()
  const invalidateQueryCache = useInvalidateQueryCache()
  const { data: rooms, loading, error } = useQuery<Room[]>('/api/rooms')

  const { mutate: joinRooms } = useMutation<Member[], { roomIds: string[] }>(
    '/api/members',
  )
  const [checkedRooms, setCheckedRooms] = useState<Record<string, boolean>>({})

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const roomIds = Object.keys(checkedRooms)
    if (!roomIds.length) {
      toast({ title: "You haven't selected any rooms", severity: 'error' })
      return
    }
    try {
      const result = await joinRooms({ roomIds })
      if (result?.length) {
        toast({ title: 'Rooms joined successfully', severity: 'success' })
        navigate(`/chat/${result[0].roomId}`)
        invalidateQueryCache(`/api/users/${auth!._id}/rooms`)
        onClose()
      }
    } catch (error) {
      toast({ title: (error as Error).message, severity: 'error' })
    }
  }

  let content

  if (error) {
    content = <div className='text-red-500'>Unable to fetch rooms</div>
  } else if (loading) {
    content = new Array(5).map((_, idx) => (
      <Skeleton key={idx} className='h-6 w-full' />
    ))
  } else if (rooms?.length) {
    content = rooms.map(room => (
      <li key={room._id}>
        <label
          className='inline-flex h-10 w-full cursor-pointer items-center justify-between px-3 font-bold hover:bg-gray-100'
          htmlFor={room._id}
        >
          <span className='w-full'>{room.name}</span>
          <input
            id={room._id}
            type='checkbox'
            checked={checkedRooms[room._id]}
            onChange={e => {
              setCheckedRooms(rooms => ({
                ...rooms,
                [room._id]: e.target.checked,
              }))
            }}
          />
        </label>
      </li>
    ))
  } else if (Array.isArray(rooms)) {
    content = <p>No more rooms to join</p>
  }

  return (
    <form
      onSubmit={handleSubmit}
      className='flex h-[400px] min-w-[350px] flex-col'
    >
      <header className='mb-3 px-6'>
        <h3 className='text-xl font-semibold'>Select rooms to join</h3>
      </header>
      <ul className='mb-4 flex flex-1 flex-col overflow-y-auto border p-3'>
        {content}
      </ul>
      <Button>Join room</Button>
    </form>
  )
}
