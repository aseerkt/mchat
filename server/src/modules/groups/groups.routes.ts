import { hasGroupPermission } from '@/middlewares'
import { Router } from 'express'
import { getGroupMember, getGroupMembers } from '../members/members.controller'
import { createMessage, listMessages } from '../messages/messages.controller'
import {
  addGroupMembers,
  changeMemberRole,
  createGroup,
  deleteGroup,
  getGroup,
  getNonGroupMembers,
  kickMember,
  leaveGroup,
  listGroups,
} from './groups.controller'

export const router = Router()

// Group Handler

router.post('/', createGroup)
router.get('/', listGroups)

router.get('/:groupId', hasGroupPermission('member'), getGroup)
router.delete('/:groupId', hasGroupPermission('owner'), deleteGroup)

// Group Member Handler

router.delete('/:groupId/leave', hasGroupPermission('member'), leaveGroup)
router.delete(
  '/:groupId/members/:memberId',
  hasGroupPermission('admin'),
  kickMember,
)
router.post('/:groupId/members', hasGroupPermission('admin'), addGroupMembers)
router.get('/:groupId/members', hasGroupPermission('member'), getGroupMembers)
router.get(
  '/:groupId/members/:userId',
  hasGroupPermission('member'),
  getGroupMember,
)
router.patch(
  '/:groupId/members/:userId',
  hasGroupPermission('admin'),
  changeMemberRole,
)
router.get(
  '/:groupId/non-members',
  hasGroupPermission('admin'),
  getNonGroupMembers,
)

// Message handler

router.get('/:groupId/messages', hasGroupPermission('member'), listMessages)
router.post('/:groupId/messages', hasGroupPermission('member'), createMessage)
