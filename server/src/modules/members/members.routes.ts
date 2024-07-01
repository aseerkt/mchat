import { Router } from 'express'
import { createMembers } from './members.controller'

export const router = Router()

router.post('/', createMembers)
