import { formateChatDate } from '@/utils/date'
import { cn } from '@/utils/style'
import { Check, CircleSlash, Ellipsis, Reply } from 'lucide-react'
import { useRef } from 'react'
import { IMessage } from '../message.interface'

interface MessageItemProps {
  message: IMessage
  isCurrentUser: boolean
  hasActionAnchor: boolean
  onMessageAction?: (
    message: IMessage,
    ref: React.RefObject<HTMLButtonElement>,
  ) => void
  onReplyAction?: (message: IMessage) => void
}

export const MessageItem = ({
  message,
  isCurrentUser,
  hasActionAnchor,
  onMessageAction,
  onReplyAction,
}: MessageItemProps) => {
  const messageAnchorRef = useRef<HTMLButtonElement>(null)
  return (
    <div
      id={'message-' + message.id}
      role='listitem'
      className={cn(
        'group/block flex w-full items-center gap-4 px-3',
        isCurrentUser && 'flex-row-reverse',
      )}
    >
      <div className='group relative' style={{ maxWidth: 'calc(100% - 2rem)' }}>
        <div
          className={cn(
            'rounded-lg border px-3 py-2 shadow',
            isCurrentUser && 'bg-cyan-100',
            message.isDeleted && 'bg-gray-100',
          )}
        >
          {!isCurrentUser && <b className='text-sm'>{message.username}</b>}
          {message.parentMessage?.id && (
            <a
              href={'#message-' + message.parentMessage.id}
              className='my-1 flex gap-2 overflow-hidden rounded-md bg-gray-200 pr-3 shadow-inner'
            >
              <div className='min-h-full w-1 bg-gray-500'></div>
              <div className='py-2'>
                <b>{message.parentMessage.username}</b>
                <div
                  className={cn(
                    'flex items-center gap-2',
                    message.parentMessage.isDeleted && 'text-sm text-gray-500',
                  )}
                >
                  {message.parentMessage.isDeleted && (
                    <CircleSlash size={16} className='text-gray-500' />
                  )}
                  <p>{message.parentMessage.content}</p>
                </div>
              </div>
            </a>
          )}
          <div
            className={cn(
              'flex items-center gap-2',
              message.isDeleted && 'text-sm text-gray-500',
            )}
          >
            {message.isDeleted && (
              <CircleSlash size={16} className='text-gray-500' />
            )}
            <p>{message.content}</p>
          </div>
          <div className='inline-flex w-full items-center justify-end gap-2 text-xs'>
            <small className='text-gray-500'>
              {formateChatDate(message.createdAt)}
            </small>
            {isCurrentUser && <Check size={14} className='text-gray-500' />}
          </div>
        </div>
        {isCurrentUser && !message.isDeleted && onMessageAction && (
          <button
            ref={messageAnchorRef}
            aria-label='message action'
            className={cn(
              'invisible absolute -right-1 -top-1 rounded border bg-white px-2 text-gray-500 shadow group-hover:visible',
              hasActionAnchor ? 'visible' : 'invisible',
            )}
            onClick={() => onMessageAction(message, messageAnchorRef)}
          >
            <Ellipsis size={18} />
          </button>
        )}
      </div>
      {onReplyAction && (
        <button
          onClick={() => onReplyAction(message)}
          aria-label='reply to message'
          className='invisible h-10 rounded-full px-2 hover:bg-gray-100 group-hover/block:visible'
        >
          <Reply size={32} className='text-blue-500' />
        </button>
      )}
    </div>
  )
}
