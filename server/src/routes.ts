import { Router } from 'express'
import { auth } from './middlewares'

import { router as groupRoutes } from '@/modules/groups/groups.routes'
import { router as memberRoutes } from '@/modules/members/members.routes'
import { router as messageRoutes } from '@/modules/messages/messages.routes'
import { router as userRoutes } from '@/modules/users/users.routes'
import { healthCheck } from './utils/api'

const rootRouter = Router()

rootRouter.get('/api', (_, res) => {
  res.send('<h1>Welcome to mChat API</h1>')
})
rootRouter.get('/api/health', healthCheck)
rootRouter.use('/api/users', userRoutes)
rootRouter.use('/api/groups', auth, groupRoutes)
rootRouter.use('/api/members', auth, memberRoutes)
rootRouter.use('/api/messages', auth, messageRoutes)

export default rootRouter
