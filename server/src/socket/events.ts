import { db } from '@/database'
import { messages } from '@/modules/messages/messages.schema'
import {
  insertMessage,
  markMessageAsRead,
} from '@/modules/messages/messages.service'
import {
  addUserSocket,
  getTypingUsers,
  getUserSockets,
  markUserOffline,
  markUserOnline,
  removeTypingUser,
  removeUserSocket,
  setTypingUser,
} from '@/redis/handlers'
import { eq } from 'drizzle-orm'
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
        const message = await insertMessage(groupId, text, socket.data.user.id)
        io.to(groupId.toString()).emit('newMessage', {
          ...message,
          username: socket.data.user.username,
        })
        cb({ message })
      } catch (error) {
        cb({ error })
      }
    })

    socket.on('markMessageAsRead', async messageId => {
      await markMessageAsRead(messageId, socket.data.user.id)
      const [message] = await db
        .select({ senderId: messages.senderId })
        .from(messages)
        .where(eq(messages.id, messageId))
        .limit(1)
      const senderSocketIds = await getUserSockets([message.senderId])
      io.to(senderSocketIds).emit('messageRead', messageId)
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
