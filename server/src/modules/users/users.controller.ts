import { db } from '@/database'
import { notFound } from '@/utils/api'
import { signTokens } from '@/utils/jwt'
import { removeAttrFromObject } from '@/utils/object'
import { hash, verify } from 'argon2'
import { and, eq, getTableColumns, like, ne } from 'drizzle-orm'
import { RequestHandler } from 'express'
import { users } from './users.schema'

export const signUpUser: RequestHandler = async (req, res, next) => {
  try {
    const { username, password, fullName } = req.body
    console.log('req.body', req.body)
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

    const accessToken = await signTokens(res, {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
    })

    res.status(201).json({ user: user, token: accessToken })
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

    const accessToken = await signTokens(res, {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
    })

    res.json({
      user: removeAttrFromObject(user, 'password'),
      token: accessToken,
    })
  } catch (error) {
    next(error)
  }
}

export const getUsers: RequestHandler = async (req, res, next) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...columns } = getTableColumns(users)
    const rows = await db
      .select(columns)
      .from(users)
      .where(
        and(
          like(users.username, `%${req.query.query}%`),
          ne(users.id, req.user!.id),
        ),
      )
      .limit(Number(req.query.limit) || 5)
      .orderBy(users.username)

    res.json(rows)
  } catch (error) {
    next(error)
  }
}

export const getUser: RequestHandler = async (req, res, next) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...columns } = getTableColumns(users)

    const [user] = await db
      .select(columns)
      .from(users)
      .where(eq(users.id, Number(req.params.userId)))
      .limit(1)
    if (!user) {
      return notFound(res, 'User')
    }
    res.json(user)
  } catch (error) {
    next(error)
  }
}
