import { db } from '@/database'
import { checkPermission } from '@/modules/members/members.service'
import { messages } from '@/modules/messages/messages.schema'
import {
  addUserSocket,
  getTypingUsers,
  markUserOffline,
  markUserOnline,
  removeTypingUser,
  removeUserSocket,
  setTypingUser,
} from '@/redis/handlers'
import { config } from '../config'
import { TypedIOServer, TypedSocket } from './socket.inteface'

async function emitTypingUsers(socket: TypedSocket, groupId: number) {
  const typingUsers = await getTypingUsers(groupId)
  socket.broadcast.to(String(groupId)).emit('typingUsers', typingUsers)
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
  io.on('connection', async socket => {
    await markUserOnline(socket.data.user.id)
    await addUserSocket(socket.data.user.id, socket.id)
    socket.broadcast.emit('userOnline', socket.data.user.id)

    socket.on('joinGroup', groupId => {
      leaveAllRoom(socket)
      socket.join(String(groupId))
    })

    socket.on('userStartedTyping', async groupId => {
      await setTypingUser(
        groupId,
        socket.data.user.id,
        socket.data.user.username,
      )
      await emitTypingUsers(socket, groupId)
    })

    socket.on('userStoppedTyping', async groupId => {
      await removeTypingUser(groupId, socket.data.user.id)
      await emitTypingUsers(socket, groupId)
    })

    socket.on('createMessage', async ({ groupId, text }, cb) => {
      try {
        const { isAllowed } = await checkPermission(
          groupId,
          socket.data.user!.id,
          'member',
        )
        if (!isAllowed) {
          throw new Error('createMessage: Not authorized')
        }

        const [message] = await db
          .insert(messages)
          .values({
            groupId,
            content: text,
            senderId: socket.data.user.id,
          })
          .returning()
        const messageWithUsername = {
          ...message,
          username: socket.data.user.username,
        }
        io.to(groupId.toString()).emit('newMessage', messageWithUsername)
        cb({ message: messageWithUsername })
      } catch (error) {
        cb({ error })
      }
    })

    socket.on('error', err => {
      console.log('socket error:', err)
    })

    socket.on('disconnect', async () => {
      await markUserOffline(socket.data.user.id)
      await removeUserSocket(socket.data.user.id, socket.id)

      socket.broadcast.emit('userOffline', socket.data.user.id)
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
