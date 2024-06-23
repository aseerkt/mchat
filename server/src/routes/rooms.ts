import { Router } from 'express'
import { getRoomMembers } from '../controllers/members'
import { createMessage, listMessages } from '../controllers/messages'
import {
  createRoom,
  deleteRoom,
  getRoom,
  listAllRooms,
} from '../controllers/rooms'
import { hasRoomPermission } from '../middlewares'

export const router = Router()

router.post('/', createRoom)
router.get('/', listAllRooms)

router.get('/:roomId', hasRoomPermission('member'), getRoom)
router.delete('/:roomId', hasRoomPermission('owner'), deleteRoom)

router.get('/:roomId/members', hasRoomPermission('member'), getRoomMembers)

router.get('/:roomId/messages', hasRoomPermission('member'), listMessages)
router.post('/:roomId/messages', createMessage)
