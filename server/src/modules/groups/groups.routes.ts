import { hasRoomPermission } from '@/middlewares'
import { Router } from 'express'
import { getGroupMembers } from '../members/members.controller'
import { createMessage, listMessages } from '../messages/messages.controller'
import {
  createGroup,
  deleteGroup,
  getGroup,
  listGroups,
} from './groups.controller'

export const router = Router()

router.post('/', createGroup)
router.get('/', listGroups)

router.get('/:groupId', hasRoomPermission('member'), getGroup)
router.delete('/:groupId', hasRoomPermission('owner'), deleteGroup)

router.get('/:groupId/members', hasRoomPermission('member'), getGroupMembers)

router.get('/:groupId/messages', hasRoomPermission('member'), listMessages)
router.post('/:groupId/messages', createMessage)
