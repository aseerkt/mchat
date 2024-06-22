import { RequestHandler } from 'express'
import { Types } from 'mongoose'
import { Room } from './models/Room'
import { verifyToken } from './utils/jwt'

export const auth: RequestHandler = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' })
    }

    const payload = verifyToken(token) as UserPayload

    req.user = payload

    next()
  } catch (error) {
    res.status(401).json({ message: 'Not authenticated' })
  }
}

export const isRoomOwner: RequestHandler = async (req, res, next) => {
  try {
    const roomId = req.params.roomId || req.query.roomId || req.body.roomId

    if (typeof roomId !== 'string') {
      throw new Error('Not authorized')
    }

    const room = await Room.findById(new Types.ObjectId(roomId))

    if (room.createdBy._id.toString() !== req.user?._id) {
      throw new Error('Not authorized')
    }

    next()
  } catch (error) {
    res.status(403).json({ message: 'Not authenticated' })
  }
}
