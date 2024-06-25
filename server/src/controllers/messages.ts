import { RequestHandler } from 'express'
import { Message } from '../models/Message'
import { findByPaginate } from '../utils/db'

export const createMessage: RequestHandler = async (req, res, next) => {
  try {
    const message = new Message({
      roomId: req.params.roomId,
      text: req.body.text,
      sender: req.user,
    })
    await message.save()
    res.status(201).json(message)
  } catch (error) {
    next(error)
  }
}

export const listMessages: RequestHandler = async (req, res, next) => {
  try {
    const filters = {
      roomId: req.params.roomId,
    }
    const result = await findByPaginate(Message, req.query, filters)
    res.json(result)
  } catch (error) {
    next(error)
  }
}
