import './utils/loadModules'

import { createAdapter } from '@socket.io/redis-streams-adapter'
import 'colors'
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from 'common/socket'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { createServer } from 'node:http'
import path from 'node:path'
import { Server } from 'socket.io'
import swaggerUi from 'swagger-ui-express'
import { config } from './config'
import { connectDB, db } from './database'
import { errorHandler } from './middlewares'
import { getRedisClient } from './redis'
import rootRouter from './routes'
import { registerSocketEvents } from './socket/events'
import { socketAuthMiddleware } from './socket/middlewares'
import swaggerDocument from './swagger-output.json'

const createApp = async () => {
  await connectDB()

  await migrate(db, { migrationsFolder: './drizzle' })

  const redisClient = getRedisClient()

  const app = express()

  app.use(
    express.urlencoded({ extended: true }),
    express.json(),
    helmet(),
    morgan(config.isProd ? 'combined' : 'dev'),
    cookieParser(),
  )

  if (!config.isProd) {
    app.use(cors({ origin: config.corsOrigin, credentials: true }))
  }

  const server = createServer(app)

  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(server, {
    cors: config.isProd
      ? undefined
      : { origin: config.corsOrigin, credentials: true },
    adapter: createAdapter(redisClient),
  })

  io.use(socketAuthMiddleware)

  registerSocketEvents(io)

  app.set('io', io)

  app.use(rootRouter)

  app.use('/api-docs', swaggerUi.serve)
  app.get('/api-docs', swaggerUi.setup(swaggerDocument))

  app.use(errorHandler)

  if (config.isProd) {
    const webStaticPath = path.join(__dirname, '..', '..', 'web', 'dist')
    app.use(express.static(webStaticPath))
    app.get('*', (_req, res) => {
      res.sendFile(path.join(webStaticPath, 'index.html'))
    })
  }

  server.listen(config.port, () => {
    console.log(`Server running at http://localhost:${config.port}`.blue.bold)
  })

  return { server }
}

createApp()
