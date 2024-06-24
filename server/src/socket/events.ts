import { Redis } from 'ioredis'
import { config } from '../config'
import { TypedIOServer, TypedSocket } from '../interfaces/socket.inteface'
import { Member } from '../models/Member'
import { Message } from '../models/Message'
import { addOnlineUser, redisKeys, removeOnlineUser } from '../utils/redis'

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
  io.on('connection', async socket => {
    await addOnlineUser(socket.data.user._id)

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
        const isMember = await Member.countDocuments({
          roomId,
          'user._id': socket.data.user._id,
        })
        if (!isMember) {
          throw new Error('createMessage: Not authorized')
        }
        const message = await Message.create({
          roomId,
          text,
          sender: socket.data.user,
        })
        io.to(roomId).emit('newMessage', message.toJSON())
        cb({ data: message })
      } catch (error) {
        cb({ error })
      }
    })

    socket.on('error', err => {
      console.log('socket error:', err)
    })

    socket.on('disconnect', async () => {
      await removeOnlineUser(socket.data.user._id)
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
