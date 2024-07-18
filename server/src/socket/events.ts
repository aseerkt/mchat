import { db } from '@/database'
import { groups } from '@/modules/groups/groups.schema'
import { members } from '@/modules/members/members.schema'
import {
  insertMessage,
  markChatMessagesAsRead,
  markMessageAsRead,
} from '@/modules/messages/messages.service'
import {
  getTypingUsers,
  markUserOffline,
  markUserOnline,
  removeTypingUser,
  setTypingUser,
} from '@/redis/handlers'
import { eq } from 'drizzle-orm'
import { Socket } from 'socket.io'
import { config } from '../config'
import {
  currentDmRoomPrefix,
  currentGroupRoomPrefix,
  roomKeys,
} from './helpers'
import { ChatMode, TypedIOServer, TypedSocket } from './socket.interface'

function leavePreviousChat(socket: Socket) {
  const rooms = Array.from(socket.rooms)
  rooms.forEach(room => {
    if (
      room.startsWith(currentGroupRoomPrefix) ||
      room.startsWith(currentDmRoomPrefix)
    ) {
      // leave previous group/dm room
      socket.leave(room)
    }
  })
}

export const registerSocketEvents = (io: TypedIOServer) => {
  io.on('connection', async socket => {
    await markUserOnline(socket.data.user.id)
    socket.broadcast.emit('userOnline', socket.data.user.id)

    const userGroups = await db
      .select({ id: groups.id })
      .from(groups)
      .innerJoin(members, eq(members.groupId, groups.id))
      .where(eq(members.userId, socket.data.user.id))

    socket.join(roomKeys.USER_KEY(socket.data.user.id))
    socket.join(userGroups.map(group => roomKeys.GROUP_KEY(group.id)))

    socket.on('joinGroup', async (groupId: number) => {
      leavePreviousChat(socket)
      socket.join(roomKeys.CURRENT_GROUP_KEY(groupId))
    })

    socket.on('joinDm', async (partnerId: number) => {
      leavePreviousChat(socket)
      socket.join(roomKeys.CURRENT_DM_KEY(socket.data.user.id, partnerId))
    })

    async function emitTypingUsers(
      socket: TypedSocket,
      { chatId, mode }: { chatId: number; mode: ChatMode },
    ) {
      const typingUsers = await getTypingUsers(chatId, mode)
      const room =
        mode === 'group'
          ? roomKeys.CURRENT_GROUP_KEY(chatId)
          : roomKeys.CURRENT_DM_KEY(socket.data.user.id, chatId)
      socket.broadcast.to(room).emit('typingUsers', typingUsers)
    }

    socket.on('typing', async ({ chatId, mode, isTyping }) => {
      if (isTyping) {
        await setTypingUser({
          chatId,
          mode,
          userId: socket.data.user.id,
          username: socket.data.user.username,
        })
      } else {
        await removeTypingUser({ chatId, mode, userId: socket.data.user.id })
      }
      await emitTypingUsers(socket, { chatId, mode })
    })

    socket.on('createMessage', async ({ groupId, receiverId, text }, cb) => {
      try {
        if (!groupId && !receiverId) {
          throw new Error('Please provide either group id or receiver id')
        }

        const message = await insertMessage({
          groupId,
          receiverId,
          content: text,
          senderId: socket.data.user.id,
        })

        const newMessage = {
          ...message,
          username: socket.data.user.username,
        }

        // group message
        if (message.groupId) {
          io.to(roomKeys.GROUP_KEY(message.groupId)).emit(
            'newMessage',
            newMessage,
          )
        }

        // direct message
        if (message.receiverId) {
          // emit event to sender
          io.to(roomKeys.USER_KEY(socket.data.user.id)).emit(
            'newMessage',
            newMessage,
          )

          // emit event to receiver
          io.to(roomKeys.USER_KEY(message.receiverId)).emit('newMessage', {
            ...newMessage,
            chatName: newMessage.username,
          })
        }
        cb({ message })
      } catch (error) {
        cb({ error })
      }
    })

    socket.on('markMessageAsRead', async messageId => {
      const messageSenderId = await markMessageAsRead(
        messageId,
        socket.data.user.id,
      )
      // let message sender know that his message is read by the current socket user
      io.to(roomKeys.USER_KEY(messageSenderId)).emit('messageRead', messageId)
    })

    socket.on('markChatMessagesAsRead', async ({ groupId, receiverId }) => {
      const unreadMessages = await markChatMessagesAsRead({
        groupId,
        receiverId,
        recipientId: socket.data.user.id,
      })

      // let the current user know that the unread messages of the group is marked as read
      io.to(roomKeys.USER_KEY(socket.data.user.id)).emit('chatMarkedAsRead', {
        groupId,
        receiverId,
      })
      // let the message senders know their message is read
      for (const message of unreadMessages) {
        io.to(roomKeys.USER_KEY(message.senderId)).emit(
          'messageRead',
          message.messageId,
        )
      }
    })

    socket.on('error', err => {
      console.log('socket error:', err)
    })

    socket.on('disconnect', async () => {
      await markUserOffline(socket.data.user.id)

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
