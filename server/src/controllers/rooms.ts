import { RequestHandler } from 'express'
import { Types } from 'mongoose'
import { Member } from '../models/Member'
import { Message } from '../models/Message'
import { Room } from '../models/Room'
import { notAuthorized, notFound } from '../utils/api'
import { findByPaginate } from '../utils/db'
import { deleteRoomMembersRoles, setMemberRole } from '../utils/redis'

export const createRoom: RequestHandler = async (req, res) => {
  // TODO: db operations over transaction

  const room = await Room.create({ name: req.body.name, createdBy: req.user })
  await Member.create({ roomId: room._id, user: req.user, role: 'owner' })

  await setMemberRole(room._id.toString(), req.user!._id, 'owner')

  res.status(201).json(room)
}

export const getRoom: RequestHandler = async (req, res) => {
  const room = await Room.findById(new Types.ObjectId(req.params.roomId))

  if (!room) {
    return notFound(res, 'Room')
  }

  res.json(room)
}

export const listAllRooms: RequestHandler = async (req, res) => {
  const rooms = await findByPaginate(Room, req.query)
  res.json(rooms)
}

export const deleteRoom: RequestHandler = async (req, res) => {
  const room = await Room.findById(new Types.ObjectId(req.params.roomId))

  if (!room) {
    return notFound(res, 'Room')
  }

  await Room.deleteOne({ _id: room._id })

  // TODO: move these db operations to queue
  await Message.deleteMany({ roomId: room._id })
  await Member.deleteMany({ roomId: room._id })
  await deleteRoomMembersRoles(room._id.toString())

  res.json({ message: 'Room deleted' })
}

export const listUserRooms: RequestHandler = async (req, res) => {
  if (req.params.userId !== req.user?._id) {
    return notAuthorized(res)
  }
  const roomIds = await findByPaginate(
    Member,
    req.query,
    { 'user._id': new Types.ObjectId(req.user!._id) },
    { roomId: 1 },
  )
  const rooms = await Room.find({
    _id: { $in: roomIds.map(r => r.roomId) },
  }).lean()
  res.json(rooms)
}
