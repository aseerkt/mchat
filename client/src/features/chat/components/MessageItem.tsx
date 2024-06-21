import { Message } from '../../../interfaces/message.interface'
import { formateChatDate } from '../../../utils/date'
import { cn } from '../../../utils/style'

interface MessageItemProps {
  message: Message
  isCurrentUser: boolean
}

export const MessageItem = ({ message, isCurrentUser }: MessageItemProps) => {
  return (
    <div
      className={cn(
        'w-fit rounded-xl border px-6 py-3 shadow',
        isCurrentUser ? 'ml-auto text-right' : 'mr-auto text-left',
      )}
    >
      <b>{message.sender.username}</b>
      <p>{message.text}</p>
      <small className='text-xs text-gray-500'>
        {formateChatDate(message.createdAt)}
      </small>
    </div>
  )
}
