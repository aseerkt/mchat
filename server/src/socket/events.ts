import { config } from '../config'
import { TypedIOServer, TypedSocket } from '../interfaces/socket.inteface'
import { Message } from '../models/Message'

const typingUsers: Record<string, Record<string, string>> = {}

function emitTypingUsers(socket: TypedSocket, roomId: string) {
  socket.broadcast.to(roomId).emit(
    'typingUsers',
    Object.keys(typingUsers[roomId] || {}).map(key => ({
      _id: key,
      username: typingUsers[roomId][key],
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

export const registerSocketEvents = (io: TypedIOServer) => {
  io.on('connection', socket => {
    socket.on('joinRoom', (roomId: string) => {
      leaveAllRoom(socket)
      socket.join(roomId)

      socket.removeAllListeners('userStartedTyping')
      socket.removeAllListeners('userStoppedTyping')
      socket.removeAllListeners('createMessage')

      socket.on('userStartedTyping', ({ roomId, username, userId }) => {
        typingUsers[roomId] = typingUsers[roomId] || {}
        typingUsers[roomId][userId] = username
        emitTypingUsers(socket, roomId)
      })

      socket.on('userStoppedTyping', ({ roomId, userId }) => {
        if (typingUsers[roomId]?.[userId]) {
          delete typingUsers[roomId][userId]
          emitTypingUsers(socket, roomId)
        }
      })

      socket.on('createMessage', async ({ roomId, text }, cb) => {
        try {
          const message = new Message({
            roomId,
            text,
            sender: socket.data.user,
          })
          await message.save()
          cb({ data: message })
          io.to(roomId).emit('newMessage', message)
        } catch (error) {
          cb({ error })
        }
      })
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
