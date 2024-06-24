import { Types } from 'mongoose'
import { config } from '../config'
import { Member } from '../models/Member'
import { Message } from '../models/Message'
import {
  addOnlineUser,
  getTypingUsers,
  removeOnlineUser,
  removeTypingUser,
  setMemberRole,
  setTypingUser,
} from '../utils/redis'
import { TypedIOServer, TypedSocket } from './socket.inteface'

async function emitTypingUsers(socket: TypedSocket, roomId: string) {
  const typingUsers = await getTypingUsers(roomId)
  socket.broadcast.to(roomId).emit('typingUsers', typingUsers)
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
    await addOnlineUser(socket.data.user._id)
    socket.broadcast.emit('userOnline', socket.data.user._id)

    socket.on('joinRoom', roomId => {
      leaveAllRoom(socket)
      socket.join(roomId)
    })

    socket.on('memberJoin', async (roomIds, cb) => {
      try {
        const members = await Member.create(
          roomIds.map((roomId: string) => ({
            roomId: new Types.ObjectId(roomId),
            user: socket.data.user,
            role: 'member',
          })),
        )
        members.forEach(member => {
          setMemberRole(
            member.roomId.toString(),
            socket.data.user._id,
            'member',
          )
          socket.broadcast
            .to(member.roomId.toString())
            .emit('newMember', member.toJSON())
        })
        cb({ success: true })
      } catch (error) {
        cb({ success: false, error })
      }
    })

    socket.on('userStartedTyping', async roomId => {
      await setTypingUser(
        roomId,
        socket.data.user._id,
        socket.data.user.username,
      )
      await emitTypingUsers(socket, roomId)
    })

    socket.on('userStoppedTyping', async roomId => {
      await removeTypingUser(roomId, socket.data.user._id)
      await emitTypingUsers(socket, roomId)
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
        cb({ message: message })
      } catch (error) {
        cb({ error })
      }
    })

    socket.on('error', err => {
      console.log('socket error:', err)
    })

    socket.on('disconnect', async () => {
      await removeOnlineUser(socket.data.user._id)
      socket.broadcast.emit('userOffline', socket.data.user._id)
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
