interface TypingIndicatorsProps {
  users: { _id: string; username: string }[]
}

export const TypingIndicators = ({ users }: TypingIndicatorsProps) => {
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
