import { useRef, useState } from 'react'
import sendSvg from '../../../assets/send-svgrepo-com.svg'
import { Button } from '../../../components/Button'
import { useAutoFocus } from '../../../hooks/useAutoFocus'
import { useToast } from '../../../hooks/useToast'
import { getSocketIO } from '../../../utils/socket'

interface MessageComposerProps {
  groupId: number
}

export const MessageComposer = ({ groupId }: MessageComposerProps) => {
  const { toast } = useToast()
  const [text, setText] = useState('')
  const [disabled, setDisabled] = useState(false)
  const socketRef = useRef(getSocketIO())
  const timeoutRef = useRef<NodeJS.Timeout>()
  const textAreaRef = useRef<HTMLInputElement>(null)

  useAutoFocus(textAreaRef, [groupId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    } else {
      socketRef.current.emit('userStartedTyping', groupId)
    }
    timeoutRef.current = setTimeout(() => {
      socketRef.current.emit('userStoppedTyping', groupId)
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
        .emitWithAck('createMessage', { groupId, text })

      if (response.message) {
        setText('')
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

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
    }
    if (event.key === 'Enter') {
      if (!event.shiftKey) {
        event.preventDefault()
        handleComposeMessage()
      }
    }
  }

  return (
    <form className='flex shrink-0 gap-2 border-t p-3' onSubmit={handleSubmit}>
      <input
        ref={textAreaRef}
        className='w-full flex-1 rounded border p-3'
        value={text}
        autoFocus
        placeholder='Send message...'
        onKeyDown={handleKeyDown}
        onChange={handleChange}
      />
      <Button disabled={disabled} aria-label='send message'>
        <img src={sendSvg} alt='send' height={24} width={24} />
      </Button>
    </form>
  )
}
