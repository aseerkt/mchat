interface TypingIndicatorsProps {
  users: { _id: string; username: string }[]
}

export const TypingIndicators = ({ users }: TypingIndicatorsProps) => {
  if (!users.length) return null
  return (
    <div>
      {users.map(user => user.username).join(', ')}{' '}
      {users.length === 1 ? 'is' : 'are'} typing
    </div>
  )
}
