import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../../components/Button'
import { Dialog } from '../../../components/Dialog'
import { useDisclosure } from '../../../hooks/useDisclosure'
import { useToast } from '../../../hooks/useToast'
import { getSocketIO } from '../../../utils/socket'
import { JoinRoomList } from './JoinRoomList'

export const JoinRoom = () => {
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
  const queryClient = useQueryClient()

  const [checkedRooms, setCheckedRooms] = useState<Record<string, boolean>>({})

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const roomIds = Object.keys(checkedRooms)
    if (!roomIds.length) {
      toast({ title: "You haven't selected any rooms", severity: 'error' })
      return
    }
    try {
      const socket = getSocketIO()
      const res = await socket.emitWithAck('memberJoin', roomIds)
      if (res?.success) {
        toast({ title: 'Rooms joined successfully', severity: 'success' })
        navigate(`/chat/${roomIds[0]}`)
        queryClient.invalidateQueries({ queryKey: ['userRooms'] })
        queryClient.invalidateQueries({ queryKey: ['roomsToJoin'] })
        onClose()
      } else if (res.error) {
        throw res.error
      }
    } catch (error) {
      toast({ title: (error as Error).message, severity: 'error' })
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className='flex h-[400px] min-w-[350px] flex-col'
    >
      <header className='mb-3 px-6'>
        <h3 className='text-xl font-semibold'>Select rooms to join</h3>
      </header>
      <JoinRoomList
        isRoomChecked={roomId => Boolean(checkedRooms[roomId])}
        toggleRoomCheck={(roomId, checked) =>
          setCheckedRooms(rooms => ({ ...rooms, [roomId]: checked }))
        }
      />
      <Button>Join room</Button>
    </form>
  )
}
