import { RequestHandler } from 'express'
import { Types } from 'mongoose'
import { Member } from '../models/Member'
import { Message } from '../models/Message'
import { Room } from '../models/Room'
import { notAuthorized, notFound } from '../utils/api'
import { findByPaginate } from '../utils/db'
import { deleteRoomMembersRoles, setMemberRole } from '../utils/redis'

export const createRoom: RequestHandler = async (req, res, next) => {
  try {
    // TODO: db operations over transaction
    const room = await Room.create({ name: req.body.name, createdBy: req.user })
    await Member.create({ roomId: room._id, user: req.user, role: 'owner' })
    await setMemberRole(room._id.toString(), req.user!._id, 'owner')
    res.status(201).json(room)
  } catch (error) {
    next(error)
  }
}

export const getRoom: RequestHandler = async (req, res, next) => {
  try {
    const room = await Room.findById(new Types.ObjectId(req.params.roomId))
    if (!room) {
      return notFound(res, 'Room')
    }
    res.json(room)
  } catch (error) {
    next(error)
  }
}

export const listRooms: RequestHandler = async (req, res, next) => {
  try {
    const userId = new Types.ObjectId(req.user!._id)
    const roomIds = await Member.distinct('roomId', { 'user._id': userId })
    const result = await findByPaginate(Room, req.query, {
      _id: {
        $nin: roomIds,
      },
    })
    res.json(result)
  } catch (error) {
    next(error)
  }
}

export const deleteRoom: RequestHandler = async (req, res, next) => {
  try {
    const room = await Room.findById(new Types.ObjectId(req.params.roomId))
    if (!room) {
      return notFound(res, 'Room')
    }
    await Room.deleteOne({ _id: room._id })

    await deleteRoomMembersRoles(room._id.toString())
    // TODO: move these db operations to queue
    await Message.deleteMany({ roomId: room._id })
    await Member.deleteMany({ roomId: room._id })

    res.json({ message: 'Room deleted' })
  } catch (error) {
    next(error)
  }
}

export const listUserRooms: RequestHandler = async (req, res, next) => {
  try {
    if (req.params.userId !== req.user?._id) {
      return notAuthorized(res)
    }
    const userId = new Types.ObjectId(req.user!._id)
    const roomIds = await Member.distinct('roomId', { 'user._id': userId })
    const result = await findByPaginate(Room, req.query, {
      _id: {
        $in: roomIds,
      },
    })
    res.json(result)
  } catch (error) {
    next(error)
  }
}
