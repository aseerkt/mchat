import { hasGroupPermission } from '@/middlewares'
import { Router } from 'express'
import { getGroupMembers } from '../members/members.controller'
import { createMessage, listMessages } from '../messages/messages.controller'
import {
  addGroupMembers,
  createGroup,
  deleteGroup,
  getGroup,
  getNonGroupMembers,
  listGroups,
} from './groups.controller'

export const router = Router()

router.post('/', createGroup)
router.get('/', listGroups)

router.get('/:groupId', hasGroupPermission('member'), getGroup)
router.delete('/:groupId', hasGroupPermission('owner'), deleteGroup)

router.post('/:groupId/members', hasGroupPermission('admin'), addGroupMembers)
router.get('/:groupId/members', hasGroupPermission('member'), getGroupMembers)
router.get(
  '/:groupId/non-members',
  hasGroupPermission('admin'),
  getNonGroupMembers,
)

router.get('/:groupId/messages', hasGroupPermission('member'), listMessages)
router.post('/:groupId/messages', hasGroupPermission('member'), createMessage)
