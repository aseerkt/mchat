import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../../components/Button'
import { Dialog } from '../../../components/Dialog'
import { useDisclosure } from '../../../hooks/useDisclosure'
import { useToast } from '../../../hooks/useToast'
import { getSocketIO } from '../../../utils/socket'
import { JoinGroupList } from './JoinGroupList'

export const JoinGroup = () => {
  const { isOpen, toggle } = useDisclosure()

  return (
    <>
      <Button className='min-w-fit' onClick={toggle}>
        Join group
      </Button>
      <Dialog isOpen={isOpen} onClose={toggle}>
        <JoinGroupsForm onClose={toggle} />
      </Dialog>
    </>
  )
}

const JoinGroupsForm = ({ onClose }: { onClose: () => void }) => {
  const { toast } = useToast()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

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
    try {
      const socket = getSocketIO()
      const res = await socket.emitWithAck('memberJoin', groupIds)
      if (res?.success) {
        toast({ title: 'Joined groups successfully', severity: 'success' })
        navigate(`/chat/${groupIds[0]}`)
        queryClient.invalidateQueries({ queryKey: ['userGroups'] })
        queryClient.invalidateQueries({ queryKey: ['groupsToJoin'] })
        onClose()
      } else if (res.error) {
        throw res.error
      }
    } catch (error) {
      toast({ title: (error as Error).message, severity: 'error' })
    }
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
