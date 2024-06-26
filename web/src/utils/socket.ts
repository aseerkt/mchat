import { io } from 'socket.io-client'
import { config } from '../config'
import { toast } from '../hooks/useToast'
import { TypedSocket } from '../interfaces/socket.interface'
import { getToken } from './token'

let socket: TypedSocket

export const getSocketIO = () => {
  const token = getToken()

  if (!token) {
    toast({ title: 'socket: no auth token', severity: 'error' })
  }

  if (!socket) {
    socket = io(config.backendUrl, {
      reconnectionAttempts: 5,
      autoConnect: false,
      auth(cb) {
        cb({ token: getToken() })
      },
    })
  }
  return socket
}
