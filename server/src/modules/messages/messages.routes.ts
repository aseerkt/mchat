import { hasChatPermission } from '@/middlewares'
import { Router } from 'express'
import { listMessages } from './messages.controller'

export const router = Router()

router.get('/', hasChatPermission('member'), listMessages)
