import { RequestHandler } from 'express'
import { Types } from 'mongoose'
import { Member, MemberRole, memberRoles } from './models/Member'
import { Room } from './models/Room'
import { notAuthenticated, notAuthorized } from './utils/api'
import { verifyToken } from './utils/jwt'
import { getMemberRole, setMemberRole } from './utils/redis'

export const auth: RequestHandler = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return notAuthenticated(res)
    }

    const payload = verifyToken(token) as UserPayload

    req.user = payload

    next()
  } catch (error) {
    notAuthenticated(res)
  }
}

export const isRoomOwner: RequestHandler = async (req, res, next) => {
  try {
    const roomId = req.params.roomId || req.query.roomId || req.body.roomId

    if (typeof roomId !== 'string') {
      throw new Error('Not authorized')
    }

    const room = await Room.findById(new Types.ObjectId(roomId))

    if (!room) {
      return res.status(404).json({ message: 'Room not found' })
    }

    if (room.createdBy._id.toString() !== req.user?._id) {
      throw new Error('Not authorized')
    }

    next()
  } catch (error) {
    res.status(403).json({ message: 'Not authenticated' })
  }
}

export const hasRoomPermission =
  (role: MemberRole): RequestHandler =>
  async (req, res, next) => {
    try {
      const roomId = req.params.roomId || req.query.roomId || req.body.roomId

      if (typeof roomId !== 'string') {
        return notAuthorized(res)
      }

      let memberRole = (await getMemberRole(
        roomId,
        req.user!._id,
      )) as MemberRole | null

      if (!memberRole) {
        const member = await Member.findOne({
          roomId: new Types.ObjectId(roomId),
          'user._id': new Types.ObjectId(req.user!._id),
        })

        if (!member) {
          return notAuthorized(res)
        }

        await setMemberRole(roomId, req.user!._id, member.role)
        memberRole = member.role
      }

      if (memberRoles.indexOf(memberRole!) < memberRoles.indexOf(role)) {
        return notAuthorized(res)
      }

      next()
    } catch (error) {
      notAuthorized(res)
    }
  }
