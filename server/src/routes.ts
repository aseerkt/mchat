import { Router } from 'express'
import { auth } from './middlewares'

import { router as groupRoutes } from '@/modules/groups/groups.routes'
import { router as memberRoutes } from '@/modules/members/members.routes'
import { router as messageRoutes } from '@/modules/messages/messages.routes'
import { router as userRoutes } from '@/modules/users/users.routes'
import {
  healthCheck,
  logout,
  recreateAccessToken,
  welcome,
} from './common/controllers'

const rootRouter = Router()

rootRouter.get('/api', welcome)
rootRouter.get('/api/health', healthCheck)
rootRouter.post('/api/refresh', recreateAccessToken)
rootRouter.delete('/api/logout', auth, logout)

rootRouter.use('/api/users', userRoutes)
rootRouter.use('/api/groups', auth, groupRoutes)
rootRouter.use('/api/members', auth, memberRoutes)
rootRouter.use('/api/messages', auth, messageRoutes)

export default rootRouter
