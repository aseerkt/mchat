import { TypedSocket } from '@/interfaces/socket.interface'
import { io } from 'socket.io-client'
import { config } from '../config'
import { toast } from '../hooks/useToast'
import { accessToken } from './token'

let socket: TypedSocket

export const getSocketIO = () => {
  if (!socket) {
    socket = io(config.backendUrl, {
      reconnectionAttempts: 5,
      autoConnect: false,
      auth(cb) {
        const token = accessToken.get()

        if (!token) {
          toast({ title: 'socket: no auth token', severity: 'error' })
        }
        cb({ token })
      },
    })
  }
  return socket
}
