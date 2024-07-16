import { hasChatPermission } from '@/middlewares'
import { Router } from 'express'
import { getGroupMember, getGroupMembers } from '../members/members.controller'
import { createMessage } from '../messages/messages.controller'
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

router.get('/:groupId', hasChatPermission('member'), getGroup)
router.delete('/:groupId', hasChatPermission('owner'), deleteGroup)

// Group Member Handler

router.delete('/:groupId/leave', hasChatPermission('member'), leaveGroup)
router.delete(
  '/:groupId/members/:memberId',
  hasChatPermission('admin'),
  kickMember,
)
router.post('/:groupId/members', hasChatPermission('admin'), addGroupMembers)
router.get('/:groupId/members', hasChatPermission('member'), getGroupMembers)
router.get(
  '/:groupId/members/:userId',
  hasChatPermission('member'),
  getGroupMember,
)
router.patch(
  '/:groupId/members/:userId',
  hasChatPermission('admin'),
  changeMemberRole,
)
router.get(
  '/:groupId/non-members',
  hasChatPermission('admin'),
  getNonGroupMembers,
)

// Message handler

router.post('/:groupId/messages', hasChatPermission('member'), createMessage)
