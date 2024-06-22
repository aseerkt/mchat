import { useRef, useState } from 'react'
import { Socket } from 'socket.io-client'
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
  const socketRef = useRef<Socket>(getSocketIO())
  const timeoutRef = useRef<NodeJS.Timeout>()
  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    } else {
      socketRef.current.emit('userStartedTyping', { roomId, ...auth })
    }
    timeoutRef.current = setTimeout(() => {
      socketRef.current.emit('userStoppedTyping', { roomId, _id: auth?._id })
      timeoutRef.current = undefined
    }, 2000)
  }

  useAutoFocus(textAreaRef, [roomId])

  const handleSendMessage = async () => {
    if (!text.trim()) {
      return toast({ title: 'Please enter text', severity: 'error' })
    }
    try {
      setDisabled(true)
      socketRef.current.emit('createMessage', { roomId, text })
    } catch (err) {
      toast({ title: (err as Error).message, severity: 'error' })
    }
  }

  return (
    <div className='flex shrink-0 gap-2 border-t p-3'>
      <textarea
        ref={textAreaRef}
        className='flex-1 rounded border p-3'
        value={text}
        autoFocus
        onChange={handleChange}
      />
      <Button type='button' disabled={disabled} onClick={handleSendMessage}>
        Send
      </Button>
    </div>
  )
}
