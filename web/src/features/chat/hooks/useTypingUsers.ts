import { getSocketIO } from '@/utils/socket'
import { useEffect, useState } from 'react'
import { ITypingUser } from '../chat.interface'

export const useTypingUsers = () => {
  const [users, setUsers] = useState<Array<ITypingUser>>([])

  useEffect(() => {
    const socket = getSocketIO()
    socket.on('typingUsers', setUsers)

    return () => {
      socket.off('typingUsers', setUsers)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { users }
}
