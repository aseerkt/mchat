import { Router } from 'express'
import { joinRooms } from './members.controller'

export const router = Router()

router.post('/', joinRooms)
