import 'colors'
import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import { createServer } from 'node:http'
import { Server, Socket } from 'socket.io'
import { config } from './config'
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from './interfaces/socket.inteface'
import { auth } from './middlewares'
import { Message } from './models/Message'
import * as routes from './routes'
import { connectDB } from './utils/db'
import { verifyToken } from './utils/jwt'

const createApp = async () => {
  await connectDB()

  const app = express()

  app.use(cors({ origin: config.corsOrigin }), express.json())

  const server = createServer(app)

  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(server, { cors: { origin: config.corsOrigin } })

  io.use((socket, next) => {
    const token = socket.handshake.auth.token
    const payload = verifyToken(token)
    socket.data.user = payload as any
    next()
  })

  const typingUsers: Record<string, Record<string, string>> = {}

  function emitTypingUsers(socket: Socket, roomId: string) {
    socket.broadcast.to(roomId).emit(
      'typingUsers',
      Object.keys(typingUsers[roomId]).map(key => ({
        _id: key,
        username: typingUsers[roomId][key],
      })),
    )
  }

  io.on('connection', socket => {
    socket.on('joinRoom', roomId => {
      socket.join(roomId)

      socket.on('userStartedTyping', ({ roomId, username, userId }) => {
        if (typingUsers[roomId]) {
          typingUsers[roomId][userId] = username
        } else {
          typingUsers[roomId] = { [userId]: username }
        }
        emitTypingUsers(socket, roomId)
      })

      socket.on('userStoppedTyping', ({ roomId, userId }) => {
        if (typingUsers[roomId]?.[userId]) {
          delete typingUsers[roomId][userId]
        }
        emitTypingUsers(socket, roomId)
      })

      socket.on('createMessage', async ({ roomId, text }) => {
        const message = new Message({ roomId, text, sender: socket.data.user })
        await message.save()
        socket.to(roomId).emit('newMessage', message)
      })
    })

    if (!config.isProd) {
      socket.onAny((event, ...args) => {
        console.log('======')
        console.log('incoming event name: ', event)
        console.log('args: ', args)
        console.log('======\n')
      })

      socket.onAnyOutgoing((event, ...args) => {
        console.log('======')
        console.log('outgoing event name: ', event)
        console.log('args: ', args)
        console.log('======\n')
      })
    }
  })

  app.get('/', (_, res) => {
    res.send('<h1>Welcome to mChat</h1>')
  })

  app.use('/api/users', routes.users)
  app.use('/api/rooms', auth, routes.rooms)

  server.listen(config.port, () => {
    console.log(`server running at http://localhost:${config.port}`.blue.bold)
  })

  return { server }
}

createApp()
