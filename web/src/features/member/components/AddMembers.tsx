import { Button } from '@/components/Button'
import { Dialog } from '@/components/Dialog'
import { UserAutoComplete } from '@/features/user/components'
import { useUsersSelect } from '@/features/user/hooks/useUsersSelect'
import { useDisclosure } from '@/hooks/useDisclosure'
import { useToast } from '@/hooks/useToast'
import { useMutation } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { addGroupMembers } from '../member.service'

export const AddMembers = () => {
  const { isOpen, toggle } = useDisclosure()
  return (
    <>
      <Button variant='secondary' className='w-full' onClick={toggle}>
        Add members
      </Button>
      <Dialog isOpen={isOpen} onClose={toggle}>
        <AddMemberForm onComplete={toggle} />
      </Dialog>
    </>
  )
}

const AddMemberForm = ({ onComplete }: { onComplete: () => void }) => {
  const userSelectProps = useUsersSelect()
  const { toast } = useToast()

  const { mutate: addMembers, isPending } = useMutation({
    mutationFn: addGroupMembers,
    onSuccess(data) {
      if (data.length) {
        toast({ title: 'Added members successfully', severity: 'success' })
        onComplete()
      }
    },
    onError(error) {
      toast({ title: error.message, severity: 'error' })
    },
  })
  const { groupId } = useParams()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const memberIds = Object.keys(userSelectProps.users).map(Number)
    if (!memberIds.length) {
      return toast({ title: 'Select at least one member', severity: 'error' })
    }
    addMembers({ memberIds, groupId: Number(groupId) })
  }

  return (
    <form className='w-full max-w-[500px]' onSubmit={handleSubmit}>
      <UserAutoComplete groupId={Number(groupId)} {...userSelectProps} />
      <Button type='submit' disabled={isPending}>
        Add members
      </Button>
    </form>
  )
}
