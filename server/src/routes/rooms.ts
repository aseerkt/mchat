import { Router } from 'express'
import {
  createMessage,
  createRoom,
  deleteRoom,
  getRoom,
  listMessages,
  listRooms,
} from '../controllers/rooms'
import { isRoomOwner } from '../middlewares'

export const router = Router()

router.post('/', createRoom)
router.get('/', listRooms)

router.get('/:roomId', getRoom)
router.delete('/:roomId', isRoomOwner, deleteRoom)

router.get('/:roomId/messages', listMessages)
router.post('/:roomId/messages', createMessage)
