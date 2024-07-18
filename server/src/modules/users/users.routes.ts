import { auth } from '@/middlewares'
import { Router } from 'express'
import { listUserGroups } from '../groups/groups.controller'
import { getUser, getUsers, loginUser, signUpUser } from './users.controller'

export const router = Router()

router.post('/', signUpUser)
router.post('/login', loginUser)

router.get('/', auth, getUsers)
router.get('/:userId', auth, getUser)

router.get('/:userId/groups', auth, listUserGroups)
