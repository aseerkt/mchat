import { Router } from 'express'
import {
  createMessage,
  createRoom,
  deleteRoom,
  getRoom,
  listMessages,
  listRooms,
} from '../controllers/rooms'

export const router = Router()

router.post('/', createRoom)
router.get('/', listRooms)

router.get('/:roomId', getRoom)
router.delete('/:roomId', deleteRoom)

router.get('/:roomId/messages', listMessages)
router.post('/:roomId/messages', createMessage)
