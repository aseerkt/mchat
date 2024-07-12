import {
  createAdapter as createClusterAdapter,
  setupPrimary,
} from '@socket.io/cluster-adapter'
import { setupMaster, setupWorker } from '@socket.io/sticky'
import 'colors'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import cluster from 'node:cluster'
import { createServer } from 'node:http'
import { availableParallelism } from 'node:os'
import { Server } from 'socket.io'
import { config } from './config'
import { connectDB } from './database'
import { auth, errorHandler } from './middlewares'
import * as routes from './routes'
import { registerSocketEvents } from './socket/events'
import { socketAuthMiddleware } from './socket/middlewares'
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from './socket/socket.interface'

const createApp = async () => {
  if (cluster.isPrimary && config.isProd) {
    console.log(`Primary ${process.pid} is running`)

    const numCPUs = availableParallelism()

    const httpServer = createServer()

    // setup sticky sessions
    setupMaster(httpServer, { loadBalancingMethod: 'least-connection' })

    // setup connection between the workers
    setupPrimary()

    httpServer.listen(config.port, () => {
      console.log(`Server running at http://localhost:${config.port}`.blue.bold)
    })

    for (let i = 0; i < numCPUs; i++) {
      // Spawn a new worker process.
      // This can only be called from the primary process.
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

  const app = express()

  app.use(
    cors({ origin: config.corsOrigin }),
    helmet(),
    express.json(),
    morgan(config.isProd ? 'combined' : 'dev'),
  )

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
    // use cluster adapter
    io.adapter(createClusterAdapter())

    // setup connection with primary process
    setupWorker(io)
  }

  io.use(socketAuthMiddleware)

  registerSocketEvents(io)

  app.set('io', io)

  app.get('/', (_, res) => {
    res.send('<h1>Welcome to mChat API</h1>')
  })

  app.use('/api/users', routes.userRoutes)
  app.use('/api/groups', auth, routes.groupRoutes)
  app.use('/api/members', auth, routes.memberRoutes)

  app.use(errorHandler)

  if (!config.isProd) {
    server.listen(config.port, () => {
      console.log(`Server running at http://localhost:${config.port}`.blue.bold)
    })
  }

  return { server }
}

createApp()
