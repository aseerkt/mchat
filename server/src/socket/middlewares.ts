import { Socket } from 'socket.io'
import { ExtendedError } from 'socket.io/dist/namespace'
import { verifyToken } from '../utils/jwt'

export const socketAuthMiddleware = (
  socket: Socket,
  next: (err?: ExtendedError) => void,
) => {
  try {
    const token = socket.handshake.auth.token
    const payload = verifyToken(token)
    socket.data.user = payload as any
    next()
  } catch (error) {
    next(new Error('Socket: Not authenticated'))
  }
}
