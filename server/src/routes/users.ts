import { Router } from 'express'
import { listUserRooms } from '../controllers/rooms'
import { loginUser, signUpUser } from '../controllers/users'
import { auth } from '../middlewares'

export const router = Router()

router.post('/', signUpUser)
router.post('/login', loginUser)

router.get('/:userId/rooms', auth, listUserRooms)
