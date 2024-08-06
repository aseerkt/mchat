import sendSvg from '@/assets/send-svgrepo-com.svg'
import { Button } from '@/components/Button'
import { useAutoFocus } from '@/hooks/useAutoFocus'
import { useToast } from '@/hooks/useToast'
import { getSocketIO } from '@/utils/socket'
import { useRef, useState } from 'react'
import { IMessage } from '../message.interface'
import { MessageReplyItem } from './MessageReplyItem'

interface MessageComposerProps {
  groupId?: number
  receiverId?: number
  replyMessage?: IMessage
  cancelReply?: () => void
}

export const MessageComposer = ({
  groupId,
  receiverId,
  replyMessage,
  cancelReply,
}: MessageComposerProps) => {
  const { toast } = useToast()
  const [text, setText] = useState('')
  const [disabled, setDisabled] = useState(false)
  const socketRef = useRef(getSocketIO())
  const timeoutRef = useRef<NodeJS.Timeout>()
  const inputRef = useRef<HTMLInputElement>(null)

  useAutoFocus(inputRef, [groupId, receiverId, replyMessage])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value)

    const payload = {
      chatId: (groupId ?? receiverId)!,
      mode: groupId ? 'group' : 'direct',
    } as const
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    } else {
      socketRef.current.emit('typing', { isTyping: true, ...payload })
    }
    timeoutRef.current = setTimeout(() => {
      socketRef.current.emit('typing', { isTyping: false, ...payload })
      timeoutRef.current = undefined
    }, 1000)
  }

  const handleComposeMessage = async () => {
    if (!text.trim()) {
      return toast({ title: 'Please enter text', severity: 'error' })
    }
    setDisabled(true)
    try {
      const response = await socketRef.current
        .timeout(5000)
        .emitWithAck('createMessage', {
          groupId,
          receiverId,
          text,
          parentMessageId: replyMessage?.id,
        })

      if (response.message) {
        setText('')
        if (cancelReply) cancelReply()
      } else if (response.error) {
        throw response.error
      }
    } catch (err) {
      toast({ title: (err as Error).message, severity: 'error' })
    } finally {
      setDisabled(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    handleComposeMessage()
  }

  // const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
  //   if (event.key === 'Enter' && !event.shiftKey) {
  //     event.preventDefault()
  //   }
  //   if (event.key === 'Enter') {
  //     if (!event.shiftKey) {
  //       event.preventDefault()
  //       handleComposeMessage()
  //     }
  //   }
  // }

  return (
    <form
      className='flex shrink-0 flex-col gap-2 border-t p-3'
      onSubmit={handleSubmit}
    >
      {replyMessage && (
        <div className='flex flex-col'>
          <p className='mb-1 text-sm font-semibold text-blue-500'>Reply</p>
          <div className='flex w-full items-center gap-2'>
            <MessageReplyItem
              username={replyMessage.username}
              content={replyMessage.content}
            />
            <Button
              type='button'
              size='sm'
              variant='secondary'
              className='text-xs font-semibold'
              aria-label='cancel reply'
              onClick={cancelReply}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
      <div className='flex gap-2'>
        <input
          ref={inputRef}
          className='w-full flex-1 rounded border p-3'
          value={text}
          autoFocus
          placeholder='Send message...'
          // onKeyDown={handleKeyDown}
          onChange={handleChange}
        />
        <Button disabled={disabled} aria-label='send message'>
          <img src={sendSvg} alt='send' height={24} width={24} />
        </Button>
      </div>
    </form>
  )
}
