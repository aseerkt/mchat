import { Button } from '@/components/Button'
import { Dialog } from '@/components/Dialog'
import { Input } from '@/components/Input'
import { useAutoFocus } from '@/hooks/useAutoFocus'
import { useDisclosure } from '@/hooks/useDisclosure'
import { useToast } from '@/hooks/useToast'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createNewRoom } from '../group.service'

const CreateRoomForm = ({ onComplete }: { onComplete: () => void }) => {
  const [name, setName] = useState('')
  const { toast } = useToast()
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()
  const { mutate: createRoom, isPending } = useMutation({
    mutationFn: createNewRoom,
    onSuccess: result => {
      if (result.id) {
        toast({ title: `Room "${name}" created`, severity: 'success' })
        onComplete()
        queryClient.invalidateQueries({ queryKey: ['userRooms'] })
        navigate(`/chat/${result.id}`)
      }
    },
    onError: error => {
      toast({ title: (error as Error).message, severity: 'error' })
    },
  })

  useAutoFocus(inputRef, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!name.trim()) {
      return toast({ title: 'Room name is required', severity: 'error' })
    }
    createRoom({ name })
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
      <Button disabled={isPending}>Create</Button>
    </form>
  )
}

export const CreateRoom = () => {
  const { isOpen, toggle } = useDisclosure()

  return (
    <>
      <Button variant='secondary' className='min-w-fit' onClick={toggle}>
        New group
      </Button>
      <Dialog isOpen={isOpen} onClose={toggle}>
        <CreateRoomForm onComplete={toggle} />
      </Dialog>
    </>
  )
}
