import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../../components/Button'
import { Dialog } from '../../../components/Dialog'
import { Input } from '../../../components/Input'
import { useAuthState } from '../../../hooks/useAuth'
import { useAutoFocus } from '../../../hooks/useAutoFocus'
import { useDisclosure } from '../../../hooks/useDisclosure'
import { useMutation } from '../../../hooks/useMutation'
import { useInvalidateQueryCache } from '../../../hooks/useQueryCache'
import { useToast } from '../../../hooks/useToast'
import { IRoom } from '../../../interfaces/room.interface'

const CreateRoomForm = ({ onComplete }: { onComplete: () => void }) => {
  const [name, setName] = useState('')
  const { toast } = useToast()
  const navigate = useNavigate()
  const auth = useAuthState()
  const inputRef = useRef<HTMLInputElement>(null)
  const invalidateQueryCache = useInvalidateQueryCache()
  const { mutate: createRoom, loading } = useMutation<IRoom, { name: string }>(
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
        toast({ title: `Room "${name}" created`, severity: 'success' })
        onComplete()
        invalidateQueryCache(`/api/users/${auth!._id}/rooms`)
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
      <Button variant='secondary' className='min-w-fit' onClick={toggle}>
        Create Room
      </Button>
      <Dialog isOpen={isOpen} onClose={toggle}>
        <CreateRoomForm onComplete={toggle} />
      </Dialog>
    </>
  )
}
