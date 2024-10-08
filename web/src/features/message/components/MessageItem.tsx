import { cn, stringToColor } from '@/utils/style'
import { Check, CircleSlash, Ellipsis, Reply } from 'lucide-react'
import { forwardRef, useRef } from 'react'
import { IMessage } from '../message.interface'
import { MessageReplyItem } from './MessageReplyItem'

interface MessageItemProps {
  message: IMessage
  isCurrentUser: boolean
  hasActionAnchor: boolean
  onMessageAction?: (
    message: IMessage,
    ref: React.RefObject<HTMLButtonElement>,
  ) => void
  onReplyAction?: (message: IMessage) => void
  scrollMessageIntoView?: (messageId: number) => void
}

export const MessageItem = forwardRef<HTMLDivElement, MessageItemProps>(
  (
    {
      message,
      isCurrentUser,
      hasActionAnchor,
      onMessageAction,
      onReplyAction,
      scrollMessageIntoView,
    },
    ref,
  ) => {
    const messageAnchorRef = useRef<HTMLButtonElement>(null)
    return (
      <div
        ref={ref}
        role='listitem'
        tabIndex={0}
        className={cn(
          'group/block flex w-full items-center gap-4 px-3 py-1 outline-none hover:bg-gray-100',
          isCurrentUser && 'flex-row-reverse',
        )}
      >
        <div className='relative' style={{ maxWidth: 'calc(100% - 2rem)' }}>
          <div
            className={cn(
              'min-w-36 rounded-lg border p-2 pb-1 shadow group-focus-within/block:ring group-focus/block:ring',
              isCurrentUser ? 'bg-cyan-100' : 'bg-white',
              message.isDeleted && 'bg-gray-100',
            )}
          >
            {!isCurrentUser && (
              <b style={{ color: stringToColor(message.username).bgColor }}>
                {message.username}
              </b>
            )}
            {message.parentMessage?.id && !message.isDeleted && (
              <div
                role='button'
                onClick={() =>
                  scrollMessageIntoView?.call(
                    undefined,
                    message.parentMessage!.id,
                  )
                }
                className='my-1'
              >
                <MessageReplyItem
                  username={message.parentMessage.username}
                  content={message.parentMessage.content}
                  isDeleted={Boolean(message.parentMessage.isDeleted)}
                />
              </div>
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
            <div className='inline-flex w-full items-center justify-end gap-1 text-xs'>
              <small className='text-gray-500'>
                {new Date(message.createdAt).toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                })}
              </small>
              {isCurrentUser && <Check size={14} className='text-gray-500' />}
            </div>
          </div>
          {isCurrentUser && !message.isDeleted && onMessageAction && (
            <button
              ref={messageAnchorRef}
              aria-label='message action'
              className={cn(
                'invisible absolute -right-1 -top-1 rounded border bg-white px-2 text-gray-500 shadow group-hover/block:visible',
                hasActionAnchor ? 'visible' : 'invisible',
              )}
              onClick={() => onMessageAction(message, messageAnchorRef)}
            >
              <Ellipsis size={18} />
            </button>
          )}
        </div>
        {onReplyAction && !message.isDeleted && (
          <button
            onClick={() => onReplyAction(message)}
            aria-label='reply to message'
            className='invisible h-10 rounded-full px-2 hover:bg-gray-200 group-hover/block:visible'
          >
            <Reply
              size={32}
              className={cn('text-blue-500', isCurrentUser && 'scale-x-[-1]')}
            />
          </button>
        )}
      </div>
    )
  },
)
