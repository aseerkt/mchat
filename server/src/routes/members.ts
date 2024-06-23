import { Router } from 'express'
import { createMembers } from '../controllers/members'

export const router = Router()

router.post('/', createMembers)
