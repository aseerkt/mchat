import { AutoComplete } from '@/components/AutoComplete'
import Chip from '@/components/Chip'
import { useQueryAutoComplete } from '@/hooks/useQueryAutoComplete'
import { useUsersSelect } from '../hooks/useUsersSelect'
import { fetchGroupNonMembers, fetchUsers } from '../user.service'

type UsersAutoCompleteProps = ReturnType<typeof useUsersSelect> & {
  groupId?: number
}

export const UserAutoComplete = ({
  groupId,
  users,
  selectUser,
  removeUser,
}: UsersAutoCompleteProps) => {
  const { suggestions, ...autocomplete } = useQueryAutoComplete(
    groupId
      ? {
          queryKey: ['nonMembers', groupId],
          queryFn: ({ queryKey }) =>
            fetchGroupNonMembers({
              groupId,
              limit: 5,
              query: queryKey[2] as string,
            }),
          initialData: [],
        }
      : {
          queryKey: ['users'],
          queryFn: ({ queryKey }) =>
            fetchUsers({ limit: 5, query: queryKey[1] as string }),
          initialData: [],
        },
    { onSelect: selectUser },
  )

  return (
    <>
      <AutoComplete
        suggestions={suggestions.filter(
          suggestion => !(suggestion.id in users),
        )}
        {...autocomplete}
        suggestionLabel='username'
        label='Select members'
        placeholder='Search by username'
      />
      <div className='mb-3 flex flex-wrap'>
        {Object.values(users).map(user => (
          <Chip
            key={user.id}
            label={user.username}
            onDelete={() => removeUser(user.id)}
          />
        ))}
      </div>
    </>
  )
}
