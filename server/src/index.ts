import {
  createAdapter as createClusterAdapter,
  setupPrimary,
} from '@socket.io/cluster-adapter'
import { setupMaster, setupWorker } from '@socket.io/sticky'
import 'colors'
import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import cluster from 'node:cluster'
import { createServer } from 'node:http'
import { availableParallelism } from 'node:os'
import { Server } from 'socket.io'
import { config } from './config'
import { auth } from './middlewares'
import * as routes from './routes'
import { registerSocketEvents } from './socket/events'
import { socketAuthMiddleware } from './socket/middlewares'
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from './socket/socket.inteface'
import { connectDB } from './utils/db'
import { getRedisClient } from './utils/redis'

const createApp = async () => {
  if (cluster.isPrimary && config.isProd) {
    console.log(`Master ${process.pid} is running`)

    const numCPUs = availableParallelism()

    const httpServer = createServer()

    setupMaster(httpServer, { loadBalancingMethod: 'least-connection' })

    setupPrimary()

    httpServer.listen(config.port, () => {
      console.log(`Server running at http://localhost:${config.port}`.blue.bold)
    })

    for (let i = 0; i < numCPUs; i++) {
      cluster.fork()
    }

    cluster.on('exit', worker => {
      console.log(`worker ${worker.process.pid} died`)
      cluster.fork()
    })

    return
  }

  console.log(`Worker ${process.pid} started`)

  await connectDB()

  const redisClient = getRedisClient()

  const app = express()

  app.use(cors({ origin: config.corsOrigin }), express.json())

  const server = createServer(app)

  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(server, {
    cors: { origin: config.corsOrigin },
  })

  if (config.isProd) {
    io.adapter(createClusterAdapter())
    setupWorker(io)
  }

  io.use(socketAuthMiddleware)

  registerSocketEvents(io)

  app.get('/', (_, res) => {
    res.send('<h1>Welcome to mChat</h1>')
  })

  app.use('/api/users', routes.users)
  app.use('/api/rooms', auth, routes.rooms)
  app.use('/api/members', auth, routes.members)

  if (!config.isProd) {
    server.listen(config.port, () => {
      console.log(`Server running at http://localhost:${config.port}`.blue.bold)
    })
  }

  return { server }
}

createApp()
