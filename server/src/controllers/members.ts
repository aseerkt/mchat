import { RequestHandler } from 'express'
import { Types } from 'mongoose'
import { Member } from '../models/Member'
import { badRequest } from '../utils/api'
import { findByPaginate } from '../utils/db'
import { getOnlineUsers, setMemberRole } from '../utils/redis'

export const createMembers: RequestHandler = async (req, res) => {
  const { roomIds } = req.body
  if (!roomIds?.length) {
    return badRequest(res, 'No room id provided')
  }

  const members = await Member.create(
    ((roomIds as string[]) ?? []).map((roomId: string) => ({
      roomId: new Types.ObjectId(roomId),
      user: req.user,
      role: 'member',
    })),
  )

  members.forEach(({ roomId }) => {
    setMemberRole(roomId.toString(), req.user!._id, 'member')
  })

  res.status(201).json(members)
}

export const getRoomMembers: RequestHandler = async (req, res) => {
  const members = await findByPaginate(Member, req.query, {
    roomId: new Types.ObjectId(req.params.roomId),
  })

  if (!members?.length) {
    res.json([])
  }

  const memberIds = members.map(m => m.user._id.toString())

  const onlineMembers = await getOnlineUsers(memberIds)

  const membersWithOnlineStatus = members.map(member => ({
    ...member,
    online: onlineMembers.has(member.user._id.toString()),
  }))

  res.json(membersWithOnlineStatus)
}
