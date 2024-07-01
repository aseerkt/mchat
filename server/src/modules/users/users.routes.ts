import { auth } from '@/middlewares'
import { Router } from 'express'
import { listUserGroups } from '../groups/groups.controller'
import { loginUser, signUpUser } from './users.controller'

export const router = Router()

router.post('/', signUpUser)
router.post('/login', loginUser)

router.get('/:userId/groups', auth, listUserGroups)
