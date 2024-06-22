import { useRef, useState } from 'react'
import { Button } from '../../../components/Button'
import { useAuthState } from '../../../hooks/useAuth'
import { useAutoFocus } from '../../../hooks/useAutoFocus'
import { useToast } from '../../../hooks/useToast'
import { getSocketIO } from '../../../utils/socket'

interface MessageComposerProps {
  roomId: string
}

export const MessageComposer = ({ roomId }: MessageComposerProps) => {
  const { toast } = useToast()
  const auth = useAuthState()
  const [text, setText] = useState('')
  const [disabled, setDisabled] = useState(false)
  const socketRef = useRef(getSocketIO())
  const timeoutRef = useRef<NodeJS.Timeout>()
  const textAreaRef = useRef<HTMLInputElement>(null)

  useAutoFocus(textAreaRef, [roomId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    } else {
      socketRef.current.emit('userStartedTyping', {
        roomId,
        userId: auth!._id,
        username: auth!.username,
      })
    }
    timeoutRef.current = setTimeout(() => {
      socketRef.current.emit('userStoppedTyping', { roomId, userId: auth!._id })
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
        .emitWithAck('createMessage', { roomId, text })

      if (response.data) {
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
        className='flex-1 rounded border p-3'
        value={text}
        autoFocus
        onKeyDown={handleKeyDown}
        onChange={handleChange}
      />
      <Button disabled={disabled}>Send</Button>
    </form>
  )
}
