import { AutoComplete } from '@/components/AutoComplete'
import { Button } from '@/components/Button'
import Chip from '@/components/Chip'
import { IUser } from '@/features/user/user.interface'
import { fetchUsers } from '@/features/user/user.service'
import { useQueryAutoComplete } from '@/hooks/useQueryAutoComplete'
import { useToast } from '@/hooks/useToast'
import { getSocketIO } from '@/utils/socket'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export const CreateDMForm = ({ onComplete }: { onComplete: () => void }) => {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [dmUser, setDmUser] = useState<IUser>()
  const { suggestions, ...autoComplete } = useQueryAutoComplete(
    {
      queryKey: ['users'],
      queryFn: ({ queryKey }) => fetchUsers({ limit: 5, query: queryKey[1] }),
      initialData: [] as IUser[],
    },
    {
      onSelect(user: IUser) {
        setDmUser(user)
      },
    },
  )

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!dmUser) {
      return toast({
        title: 'Select user to direct message',
        severity: 'error',
      })
    }

    try {
      const socket = getSocketIO()

      const result = await socket.emitWithAck('createMessage', {
        receiverId: dmUser.id,
        text: `Hi`,
      })
      if (result.message) {
        navigate(`/chat/direct/${dmUser.id}`)
        onComplete()
      } else if (result.error) {
        toast({
          title: (result.error as Error)?.message || 'Something went wrong',
          severity: 'error',
        })
      }
    } catch (error) {
      toast({
        title: (error as Error)?.message || 'Something went wrong',
        severity: 'error',
      })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className='mb-3 text-xl font-bold'>Direct message</h2>
      <div className='mb-3'>
        <AutoComplete
          suggestions={suggestions.filter(
            suggestion => suggestion.id !== dmUser?.id,
          )}
          {...autoComplete}
          suggestionLabel='username'
          placeholder='Search by username'
          label='Search user'
        >
          {dmUser && <Chip label={dmUser.username} />}
        </AutoComplete>
      </div>
      <Button>Say hi</Button>
    </form>
  )
}
