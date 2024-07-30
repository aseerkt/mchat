import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { UserAutoComplete } from '@/features/user/components'
import { useUsersSelect } from '@/features/user/hooks/useUsersSelect'
import { useToast } from '@/hooks/useToast'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createNewGroup } from '../group.service'

export const CreateGroupForm = ({ onComplete }: { onComplete: () => void }) => {
  const [name, setName] = useState('')
  const { toast } = useToast()
  const navigate = useNavigate()
  const userSelectProps = useUsersSelect()

  const { mutate: createGroup, isPending } = useMutation({
    mutationFn: createNewGroup,
    onSuccess: result => {
      if (result.id) {
        toast({ title: `Group "${name}" created`, severity: 'success' })
        onComplete()
        navigate(`/chat/group/${result.id}`)
      }
    },
    onError: error => {
      toast({ title: (error as Error).message, severity: 'error' })
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!name.trim()) {
      return toast({ title: 'Group name is required', severity: 'error' })
    }
    const memberIds = Object.keys(userSelectProps.users).map(Number)
    if (!memberIds.length) {
      return toast({ title: 'Select at least one member', severity: 'error' })
    }
    createGroup({
      name,
      memberIds,
    })
  }

  return (
    <form onSubmit={handleSubmit} className='w-full'>
      <h4 className='mb-3 text-xl font-semibold'>Create group</h4>
      <Input
        name='name'
        value={name}
        label='Group name'
        autoFocus
        onChange={e => setName(e.target.value)}
      />
      <div className='mb-3'>
        <UserAutoComplete {...userSelectProps} />
      </div>
      <Button disabled={isPending}>Create</Button>
    </form>
  )
}
