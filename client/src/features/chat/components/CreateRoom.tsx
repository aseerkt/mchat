import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../../components/Button'
import { Dialog } from '../../../components/Dialog'
import { Input } from '../../../components/Input'
import { useAutoFocus } from '../../../hooks/useAutoFocus'
import { useDisclosure } from '../../../hooks/useDisclosure'
import { useMutation } from '../../../hooks/useMutation'
import { useInvalidateQueryCache } from '../../../hooks/useQueryCache'
import { useToast } from '../../../hooks/useToast'
import { Room } from '../../../interfaces/room.interface'

const CreateRoomForm = ({ onComplete }: { onComplete: () => void }) => {
  const [name, setName] = useState('')
  const { toast } = useToast()
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const invalidateQueryCache = useInvalidateQueryCache()
  const { mutate: createRoom, loading } = useMutation<Room, { name: string }>(
    '/api/rooms',
  )

  useAutoFocus(inputRef, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!name.trim()) {
      return toast({ title: 'Room name is required', severity: 'error' })
    }
    try {
      const result = await createRoom({ name })
      if (result._id) {
        toast({ title: `Room "${name}" created` })
        onComplete()
        invalidateQueryCache('/api/rooms')
        navigate(`/chat/${result._id}`)
      }
    } catch (error) {
      toast({ title: (error as Error).message, severity: 'error' })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h4 className='mb-3 text-xl font-semibold'>Create room</h4>
      <Input
        ref={inputRef}
        name='name'
        value={name}
        label='Room name'
        autoFocus
        onChange={e => setName(e.target.value)}
      />
      <Button disabled={loading}>Create</Button>
    </form>
  )
}

export const CreateRoom = () => {
  const { isOpen, toggle } = useDisclosure()

  return (
    <>
      <Button onClick={toggle}>+ Room</Button>
      {isOpen && (
        <Dialog isOpen={isOpen} onClose={toggle}>
          <CreateRoomForm onComplete={toggle} />
        </Dialog>
      )}
    </>
  )
}
