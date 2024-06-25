import { RequestHandler } from 'express'
import { Types } from 'mongoose'
import { Member } from '../models/Member'
import { badRequest } from '../utils/api'
import { findByPaginate } from '../utils/db'
import { getOnlineUsers, setMemberRole } from '../utils/redis'

export const createMembers: RequestHandler = async (req, res, next) => {
  try {
    const { roomIds } = req.body
    if (!roomIds?.length) {
      return badRequest(res, 'No room id provided')
    }

    const members = await Member.create(
      (roomIds as string[]).map((roomId: string) => ({
        roomId: new Types.ObjectId(roomId),
        user: req.user,
        role: 'member',
      })),
    )

    members.forEach(({ roomId }) => {
      setMemberRole(roomId.toString(), req.user!._id, 'member')
    })

    res.status(201).json(members)
  } catch (error) {
    next(error)
  }
}

export const getRoomMembers: RequestHandler = async (req, res, next) => {
  try {
    const result = await findByPaginate(Member, req.query, {
      roomId: new Types.ObjectId(req.params.roomId),
    })

    if (!result.data?.length) {
      return res.json([])
    }

    const memberIds = result.data.map(m => m.user._id.toString())

    const onlineMembers = await getOnlineUsers(memberIds)

    const membersWithOnlineStatus = result.data.map(member => ({
      ...member,
      online: onlineMembers.has(member.user._id.toString()),
    }))

    res.json({ data: membersWithOnlineStatus, hasMore: result.hasMore })
  } catch (error) {
    next(error)
  }
}
