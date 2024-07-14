import { Button } from '@/components/Button'
import { useToast } from '@/hooks/useToast'
import { useMutation } from '@tanstack/react-query'
import { kickMember } from '../member.service'

export const KickMember = ({
  groupId,
  userId,
  onComplete,
}: {
  groupId: number
  userId: number
  onComplete: () => void
}) => {
  const { toast } = useToast()
  const { mutate, isPending } = useMutation({
    mutationFn: kickMember,
    onSuccess() {
      toast({ title: 'Member kicked from group', severity: 'success' })
      onComplete()
    },
    onError(error) {
      toast({ title: error.message, severity: 'error' })
    },
  })
  return (
    <Button disabled={isPending} onClick={() => mutate({ groupId, userId })}>
      Kick member
    </Button>
  )
}
