import { hasChatPermission } from '@/middlewares'
import { Router } from 'express'
import {
  deleteMessage,
  listMessageRecipients,
  listMessages,
} from './messages.controller'

export const router = Router()

router.get('/', hasChatPermission('member'), listMessages)

router.delete('/:messageId', deleteMessage)

router.get('/:messageId/recipients', listMessageRecipients)
