import { formateChatDate } from '../../../utils/date'
import { cn } from '../../../utils/style'
import { IMessage } from '../message.interface'

interface MessageItemProps {
  message: IMessage
  isCurrentUser: boolean
}

export const MessageItem = ({ message, isCurrentUser }: MessageItemProps) => {
  return (
    <div
      className={cn(
        'w-fit rounded-xl border px-6 py-3 shadow',
        isCurrentUser ? 'ml-auto' : 'mr-auto bg-cyan-100',
      )}
      style={{ maxWidth: 'calc(80% - 2rem)' }}
    >
      {!isCurrentUser && <b>{message.sender.username}</b>}
      <p>{message.text}</p>
      <small className='text-xs text-gray-500'>
        {formateChatDate(message.createdAt)}
      </small>
    </div>
  )
}
