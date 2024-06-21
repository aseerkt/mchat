import { Router } from 'express'
import { loginUser, signUpUser } from '../controllers/users'

export const router = Router()

router.post('/', signUpUser)
router.post('/login', loginUser)
