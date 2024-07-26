import { Socket } from 'socket.io'
import { ExtendedError } from 'socket.io/dist/namespace'
import { verifyAccessToken } from '../utils/jwt'

export const socketAuthMiddleware = (
  socket: Socket,
  next: (err?: ExtendedError) => void,
) => {
  try {
    const token = socket.handshake.auth.token
    const payload = verifyAccessToken(token)
    socket.data.user = payload as UserPayload
    next()
  } catch (error) {
    next(new Error('Socket: Not authenticated'))
  }
}
