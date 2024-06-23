import { Redis } from 'ioredis'
import { config } from '../config'
import { TypedIOServer, TypedSocket } from '../interfaces/socket.inteface'
import { Message } from '../models/Message'
import { redisKeys } from '../utils/redis'

async function emitTypingUsers(
  socket: TypedSocket,
  redisClient: Redis,
  roomId: string,
) {
  const typingUsers = await redisClient.hgetall(redisKeys.TYPING_USERS(roomId))
  socket.broadcast.to(roomId).emit(
    'typingUsers',
    Object.keys(typingUsers).map(key => ({
      _id: key,
      username: typingUsers[key],
    })),
  )
}

function leaveAllRoom(socket: TypedSocket) {
  const rooms = Array.from(socket.rooms)
  rooms.forEach(room => {
    if (room !== socket.id) {
      // don't leave the default room
      socket.leave(room)
    }
  })
}

export const registerSocketEvents = (io: TypedIOServer, redisClient: Redis) => {
  io.on('connection', socket => {
    socket.on('joinRoom', (roomId: string) => {
      leaveAllRoom(socket)
      socket.join(roomId)
    })

    socket.on('userStartedTyping', async ({ roomId, username, userId }) => {
      await redisClient.hset(redisKeys.TYPING_USERS(roomId), userId, username)
      await emitTypingUsers(socket, redisClient, roomId)
    })

    socket.on('userStoppedTyping', async ({ roomId, userId }) => {
      await redisClient.hdel(redisKeys.TYPING_USERS(roomId), userId)
      await emitTypingUsers(socket, redisClient, roomId)
    })

    socket.on('createMessage', async ({ roomId, text }, cb) => {
      try {
        const message = new Message({
          roomId,
          text,
          sender: socket.data.user,
        })
        await message.save()
        io.to(roomId).emit('newMessage', message)
        cb({ data: message })
      } catch (error) {
        cb({ error })
      }
    })

    socket.on('error', err => {
      console.log('socket error:', err)
    })

    if (!config.isProd) {
      socket.onAny((event, ...args) => {
        console.log('INCOMING event:', event, 'args:', args)
      })

      socket.onAnyOutgoing((event, ...args) => {
        console.log('OUTGOING event:', event, 'args:', args)
      })
    }
  })
}
