import { Button } from '@/components/Button'
import { useToast } from '@/hooks/useToast'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { deleteGroup } from '../group.service'

export const DeleteGroup = ({ groupId }: { groupId: number }) => {
  const { toast } = useToast()
  const navigate = useNavigate()
  const { mutate, isPending } = useMutation({
    mutationFn: deleteGroup,
    onSuccess() {
      toast({ title: 'Delete group', severity: 'info' })
      navigate('/chat', { replace: true })
    },
    onError(error) {
      toast({
        title: error.message ?? 'Something went wrong',
        severity: 'error',
      })
    },
  })
  return (
    <Button
      variant='secondary'
      color='error'
      disabled={isPending}
      onClick={() => mutate(groupId)}
    >
      Delete group
    </Button>
  )
}
