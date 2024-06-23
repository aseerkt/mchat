import { useEffect, useState } from 'react'
import { getSocketIO } from '../../../utils/socket'

export const TypingIndicator = () => {
  const [users, setUsers] = useState<Array<{ _id: string; username: string }>>(
    [],
  )

  useEffect(() => {
    const socket = getSocketIO()
    socket.on('typingUsers', setUsers)

    return () => {
      socket.off('typingUsers', setUsers)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  let content

  if (!users.length) {
    content = null
  } else {
    content = (
      <small className='text-sm text-gray-500'>
        <b>{users.map(user => user.username).join(', ')} </b>
        {users.length === 1 ? 'is' : 'are'} typing...
      </small>
    )
  }

  return <div className='h-6 border-t bg-green-50 px-3'>{content}</div>
}
