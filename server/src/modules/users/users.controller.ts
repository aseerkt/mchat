import { db } from '@/database'
import { signToken } from '@/utils/jwt'
import { removeAttrFromObject } from '@/utils/object'
import { hash, verify } from 'argon2'
import { eq } from 'drizzle-orm'
import { RequestHandler } from 'express'
import { users } from './users.schema'

export const signUpUser: RequestHandler = async (req, res, next) => {
  try {
    const { username, password, fullName } = req.body
    const rows = await db
      .select({ username: users.username })
      .from(users)
      .where(eq(users.username, username))
      .limit(1)

    if (rows.length) {
      return res.status(400).json({ message: 'Username already taken' })
    }

    const hashedPassword = await hash(password)

    const [user] = await db
      .insert(users)
      .values({ username, fullName, password: hashedPassword })
      .returning({
        id: users.id,
        username: users.username,
        fullName: users.fullName,
        createdAt: users.createdAt,
      })

    const token = signToken({
      id: user.id,
      username: user.username,
      fullName: user.fullName,
    })

    res.status(201).json({ user: user, token })
  } catch (error) {
    next(error)
  }
}

export const loginUser: RequestHandler = async (req, res, next) => {
  try {
    const { username, password } = req.body
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1)

    if (!user) {
      return res.status(400).json({ message: 'Invalid username/password' })
    }

    const isPwdValid = await verify(user.password, password)

    if (!isPwdValid) {
      return res.status(400).json({ message: 'Invalid username/password' })
    }

    const token = signToken({
      id: user.id,
      username: user.username,
      fullName: user.fullName,
    })

    res.json({ user: removeAttrFromObject(user, 'password'), token })
  } catch (error) {
    next(error)
  }
}
