import { db } from '@/database'
import { groups } from '@/modules/groups/groups.schema'
import { members } from '@/modules/members/members.schema'
import { checkPermission } from '@/modules/members/members.service'
import { messageRecipients, messages } from '@/modules/messages/messages.schema'
import {
  insertMessage,
  markMessageAsRead,
} from '@/modules/messages/messages.service'
import {
  addUserSocket,
  getMultipleUserSockets,
  getTypingUsers,
  getUserSockets,
  markUserOffline,
  markUserOnline,
  removeTypingUser,
  removeUserSocket,
  setTypingUser,
} from '@/redis/handlers'
import { and, eq, isNull } from 'drizzle-orm'
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
      const [message] = await db
        .select({ senderId: messages.senderId, groupId: messages.groupId })
        .from(messages)
        .where(eq(messages.id, messageId))
        .limit(1)
      if (!message?.groupId) {
        throw new Error(
          'markMessageAsRead: message does not belongs to a group',
        )
      }

      const { isAllowed } = await checkPermission(
        message.groupId,
        socket.data.user.id,
        'member',
      )

      if (!isAllowed) {
        throw new Error(
          "markMessageAsRead: you don't have permission to mark the message as read",
        )
      }

      await markMessageAsRead(messageId, socket.data.user.id)
      const senderSocketIds = await getMultipleUserSockets([message.senderId])
      io.to(senderSocketIds).emit('messageRead', messageId)
    })

    socket.on('markGroupMessagesAsRead', async groupId => {
      const { isAllowed } = await checkPermission(
        groupId,
        socket.data.user.id,
        'member',
      )

      if (!isAllowed) {
        throw new Error(
          "markGroupMessagesAsRead: you don't have permission to mark the message as read",
        )
      }

      const unreadMessages = await db
        .select({ messageId: messages.id, senderId: messages.senderId })
        .from(messages)
        .leftJoin(
          messageRecipients,
          and(
            eq(messageRecipients.messageId, messages.id),
            eq(messageRecipients.recipientId, socket.data.user.id),
          ),
        )
        .where(
          and(
            eq(messages.groupId, groupId),
            isNull(messageRecipients.messageId),
          ),
        )

      if (unreadMessages.length) {
        await db.insert(messageRecipients).values(
          unreadMessages.map(message => ({
            messageId: message.messageId,
            recipientId: socket.data.user.id,
          })),
        )

        const socketIds = await getUserSockets(socket.data.user.id)

        io.to(socketIds).emit('groupMarkedAsRead', groupId)
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
