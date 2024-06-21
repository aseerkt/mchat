import { useState } from 'react'
import { Button } from '../../../components/Button'
import { Dialog } from '../../../components/Dialog'
import { Input } from '../../../components/Input'
import { useDisclosure } from '../../../hooks/useDisclosure'
import { useMutation } from '../../../hooks/useMutation'
import { useToast } from '../../../hooks/useToast'
import { Room } from '../../../interfaces/room.interface'

const CreateRoomForm = ({ onComplete }: { onComplete: () => void }) => {
  const [name, setName] = useState('')
  const { toast } = useToast()
  const { mutate: createRoom } = useMutation<Room, { name: string }>(
    '/api/rooms',
  )

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!name) {
      return toast({ title: 'Room name is required', severity: 'error' })
    }
    try {
      const result = await createRoom({ name })
      if (result._id) {
        toast({ title: `Room "${name}" created` })
        onComplete()
      }
    } catch (error) {
      toast({ title: (error as Error).message, severity: 'error' })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Input name='name' value={name} onChange={e => setName(e.target.name)} />
      <Button>Create room</Button>
    </form>
  )
}

export const CreateRoom = () => {
  const { isOpen, toggle } = useDisclosure()

  return (
    <>
      <Button onClick={toggle}>Create room</Button>
      <Dialog isOpen={isOpen} onClose={toggle}>
        <CreateRoomForm onComplete={toggle} />
      </Dialog>
    </>
  )
}
