import 'colors'
import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import { config } from './config'
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from './interfaces/socket.inteface'
import { auth } from './middlewares'
import * as routes from './routes'
import { registerSocketEvents } from './socket/events'
import { socketAuthMiddleware } from './socket/middlewares'
import { connectDB } from './utils/db'

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

  io.use(socketAuthMiddleware)

  registerSocketEvents(io)

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
