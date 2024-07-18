import { useTypingUsers } from '../hooks/useTypingUsers'

export const TypingIndicator = () => {
  const { users } = useTypingUsers()

  let content

  if (!users.length) {
    content = null
  } else {
    content = (
      <small className='text-sm text-gray-500'>
        <b>
          {users
            .map(user => user.username)
            .slice(0, 3)
            .join(', ')}{' '}
        </b>
        {users.length === 1 ? 'is' : `${ users.length }are`} typing...
      </small>
    )
  }

  return <div className='h-6 border-t bg-green-50 px-3'>{content}</div>
}
