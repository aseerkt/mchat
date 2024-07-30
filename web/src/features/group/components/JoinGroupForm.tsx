import { Button } from '@/components/Button'
import { useToast } from '@/hooks/useToast'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { joinGroups } from '../group.service'
import { JoinGroupList } from './JoinGroupList'

export const JoinGroupsForm = ({ onComplete }: { onComplete: () => void }) => {
  const { toast } = useToast()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { mutate: joinMultipleGroups } = useMutation({
    mutationFn: joinGroups,
    onSuccess: data => {
      if (data.length) {
        navigate(`/chat`)
        toast({ title: 'Joined groups successfully', severity: 'success' })
        queryClient.invalidateQueries({ queryKey: ['userGroups'] })
        queryClient.invalidateQueries({ queryKey: ['groupsToJoin'] })
        onComplete()
      }
    },
    onError: error => {
      toast({ title: (error as Error).message, severity: 'error' })
    },
  })

  const [selectedGroups, setSelectedGroups] = useState<Record<number, boolean>>(
    {},
  )

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const groupIds = Object.keys(selectedGroups).map(Number)
    if (!groupIds.length) {
      toast({ title: "You haven't selected any groups", severity: 'error' })
      return
    }
    joinMultipleGroups({ groupIds })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className='flex h-[400px] min-w-[350px] flex-col'
    >
      <header className='mb-3 px-6'>
        <h3 className='text-xl font-semibold'>Select groups to join</h3>
      </header>
      <JoinGroupList
        isGroupChecked={groupId => Boolean(selectedGroups[groupId])}
        toggleGroupCheck={(groupId, checked) =>
          setSelectedGroups(groups => ({ ...groups, [groupId]: checked }))
        }
      />
      <Button>Join</Button>
    </form>
  )
}
