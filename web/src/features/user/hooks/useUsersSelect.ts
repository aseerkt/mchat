import { useCallback, useState } from 'react'
import { IUser } from '../user.interface'

export const useUsersSelect = () => {
  const [users, setUsers] = useState<Record<string, IUser>>({})

  const selectUser = useCallback((user: IUser) => {
    setUsers(users => ({ ...users, [user.id]: user }))
  }, [])

  const removeUser = useCallback(
    (userId: number) =>
      setUsers(users => {
        delete users[userId]
        return { ...users }
      }),
    [],
  )

  return { users, selectUser, removeUser }
}
