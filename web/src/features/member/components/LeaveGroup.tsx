import { AutoComplete } from '@/components/AutoComplete'
import { Button } from '@/components/Button'
import Chip from '@/components/Chip'
import { Dialog } from '@/components/Dialog'
import { useHasPermission } from '@/features/member/hooks'
import { useDisclosure } from '@/hooks/useDisclosure'
import { useQueryAutoComplete } from '@/hooks/useQueryAutoComplete'
import { useToast } from '@/hooks/useToast'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { IMember } from '../member.interface'
import { fetchGroupMembers, leaveGroup } from '../member.service'

export const LeaveGroup = () => {
  const { isOpen, open, close } = useDisclosure()
  return (
    <>
      <Button
        variant='secondary'
        color='error'
        className='w-full'
        onClick={open}
      >
        Leave group
      </Button>
      <Dialog isOpen={isOpen} onClose={close}>
        <LeaveGroupForm onClose={close} />
      </Dialog>
    </>
  )
}

export const LeaveGroupForm = ({ onClose }: { onClose: () => void }) => {
  const params = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const groupId = Number(params.groupId)
  const { currentMember } = useHasPermission(groupId, true)
  const [newOwner, setNewOwner] = useState<IMember>()
  const queryClient = useQueryClient()

  const isOwner = currentMember && currentMember.role === 'owner'

  const autocomplete = useQueryAutoComplete(
    {
      queryKey: ['members', groupId],
      queryFn: async ({ queryKey }) =>
        fetchGroupMembers({
          groupId: queryKey[1] as number,
          limit: 5,
          cursor: null,
          query: queryKey[2] as string,
        }).then(result => result.data),
      initialData: [] as IMember[],
      enabled: isOwner,
    },
    {
      onSelect(suggestion: IMember) {
        setNewOwner(suggestion)
      },
    },
  )

  const { mutate } = useMutation({
    mutationFn: leaveGroup,
    onSuccess() {
      toast({ title: 'Successfully left the group', severity: 'success' })
      onClose()
      queryClient.invalidateQueries({ queryKey: ['userGroups'] })
      navigate('/chat')
    },
    onError(error) {
      toast({
        title: error.message ?? 'Something went wrong',
        severity: 'error',
      })
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isOwner && !newOwner?.userId) {
      toast({ title: 'Please select new owner', severity: 'info' })
    }
    mutate({ groupId, newOwnerId: newOwner?.userId })
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1 className='mb-2 text-xl font-bold'>Leave group</h1>
      <p className='mb-2'>Are you sure you want to leave the group?</p>
      <div className='mb-6'>
        {isOwner && (
          <AutoComplete
            label='Please select a new owner before you leave'
            {...autocomplete}
            suggestionLabel='username'
            placeholder='Search by username'
          >
            {newOwner ? <Chip label={newOwner.username} /> : null}
          </AutoComplete>
        )}
      </div>
      <div className='flex justify-end gap-2'>
        <Button type='button' variant='secondary' autoFocus onClick={onClose}>
          Cancel
        </Button>
        <Button type='submit' color='error'>
          Confirm
        </Button>
      </div>
    </form>
  )
}
