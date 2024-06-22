import { RequestHandler } from 'express'
import { Types } from 'mongoose'
import { Message } from '../models/Message'
import { Room } from '../models/Room'
import { findByPaginate } from '../utils/db'

export const createRoom: RequestHandler = async (req, res) => {
  const room = new Room({ name: req.body.name, createdBy: req.user })
  await room.save()
  res.status(201).json(room)
}

export const getRoom: RequestHandler = async (req, res) => {
  const room = await Room.findById(new Types.ObjectId(req.params.roomId))
  res.json(room)
}

export const listRooms: RequestHandler = async (req, res) => {
  const rooms = await findByPaginate(Room, req.query)
  res.json(rooms)
}

export const deleteRoom: RequestHandler = async (req, res) => {
  const result = await Room.deleteOne({ _id: req.params.roomId })
  res.json(result)
}

export const createMessage: RequestHandler = async (req, res) => {
  const message = new Message({
    roomId: req.params.roomId,
    text: req.body.text,
    sender: req.user,
  })
  await message.save()
  res.status(201).json(message)
}

export const listMessages: RequestHandler = async (req, res) => {
  const filters = {
    roomId: req.params.roomId,
  }
  const messages = await findByPaginate(Message, req.query, filters)
  res.json(messages)
}
