import { Router } from 'express'
import { auth } from './middlewares'

import { router as groupRoutes } from '@/modules/groups/groups.routes'
import { router as memberRoutes } from '@/modules/members/members.routes'
import { router as userRoutes } from '@/modules/users/users.routes'

const rootRouter = Router()

rootRouter.use('/api/users', userRoutes)
rootRouter.use('/api/groups', auth, groupRoutes)
rootRouter.use('/api/members', auth, memberRoutes)

export default rootRouter
