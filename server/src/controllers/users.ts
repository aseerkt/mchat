import { RequestHandler } from 'express'
import { User } from '../models/User'
import { signToken } from '../utils/jwt'
import { removeAttrFromObject } from '../utils/object'

export const signUpUser: RequestHandler = async (req, res, next) => {
  try {
    const { username, password } = req.body
    let user = await User.findOne({ username })

    if (user) {
      return res.status(400).json({ message: 'Username already taken' })
    }

    user = new User({ username, password })
    await user.save()

    const token = signToken({
      _id: user._id.toString(),
      username: user.username,
    })

    res
      .status(201)
      .json({ user: removeAttrFromObject(user.toJSON(), 'password'), token })
  } catch (error) {
    next(error)
  }
}

export const loginUser: RequestHandler = async (req, res, next) => {
  try {
    const { username, password } = req.body
    const user = await User.findOne({ username }).select('+password')

    if (!user) {
      return res.status(400).json({ message: 'Invalid username/password' })
    }

    const isPwdValid = await user.verifyPassword(password)

    if (!isPwdValid) {
      return res.status(400).json({ message: 'Invalid username/password' })
    }

    const token = signToken({
      _id: user._id.toString(),
      username: user.username,
    })

    res.json({ user: removeAttrFromObject(user.toJSON(), 'password'), token })
  } catch (error) {
    next(error)
  }
}
