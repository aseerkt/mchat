import { db } from '@/database'
import { groups } from '@/modules/groups/groups.schema'
import { members } from '@/modules/members/members.schema'
import {
  insertMessage,
  markGroupMessagesAsRead,
  markMessageAsRead,
} from '@/modules/messages/messages.service'
import {
  addUserSocket,
  getTypingUsers,
  markUserOffline,
  markUserOnline,
  removeTypingUser,
  removeUserSocket,
  setTypingUser,
} from '@/redis/handlers'
import { eq } from 'drizzle-orm'
import { config } from '../config'
import { getGroupRoomId } from './helpers'
import { TypedIOServer, TypedSocket } from './socket.interface'

export const groupRoomPrefix = 'group'

async function emitTypingUsers(socket: TypedSocket, groupId: number) {
  const typingUsers = await getTypingUsers(groupId)
  socket.broadcast.to(getGroupRoomId(groupId)).emit('typingUsers', typingUsers)
}

export const registerSocketEvents = (io: TypedIOServer) => {
  io.on('connection', async socket => {
    await markUserOnline(socket.data.user.id)
    await addUserSocket(socket.data.user.id, socket.id)
    socket.broadcast.emit('userOnline', socket.data.user.id)

    const userGroups = await db
      .select({ id: groups.id })
      .from(groups)
      .innerJoin(members, eq(members.groupId, groups.id))
      .where(eq(members.userId, socket.data.user.id))
    socket.join(userGroups.map(group => group.id.toString()))

    socket.on('joinGroup', async (groupId: number) => {
      const rooms = Array.from(socket.rooms)
      rooms.forEach(room => {
        if (room !== socket.id && room.startsWith(groupRoomPrefix)) {
          // don't leave the default room
          socket.leave(room)
        }
      })
      socket.join(getGroupRoomId(groupId))
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
      const messageSenderSocketIds = await markMessageAsRead(
        messageId,
        socket.data.user.id,
      )
      // let message sender know that his message is read by the current socket user
      io.to(messageSenderSocketIds).emit('messageRead', messageId)
    })

    socket.on('markGroupMessagesAsRead', async groupId => {
      const socketIds = await markGroupMessagesAsRead(
        groupId,
        socket.data.user.id,
      )

      if (socketIds?.length) {
        // let the current user know that the unread messages of the group is marked as read
        io.to(socketIds).emit('groupMarkedAsRead', groupId)
        // TODO: let the message senders know their message is read
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
