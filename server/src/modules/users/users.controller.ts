import { db } from '@/database'
import { notFound } from '@/utils/api'
import { signTokens } from '@/utils/jwt'
import { removeAttrFromObject } from '@/utils/object'
import { hash, verify } from 'argon2'
import { usersTable } from 'common/tables'
import { and, eq, getTableColumns, like, ne } from 'drizzle-orm'
import { RequestHandler } from 'express'

export const signUpUser: RequestHandler = async (req, res, next) => {
  try {
    const { username, password, fullName } = req.body
    const rows = await db
      .select({ username: usersTable.username })
      .from(usersTable)
      .where(eq(usersTable.username, username))
      .limit(1)

    if (rows.length) {
      return res.status(400).json({ message: 'Username already taken' })
    }

    const hashedPassword = await hash(password)

    const [user] = await db
      .insert(usersTable)
      .values({ username, fullName, password: hashedPassword })
      .returning({
        id: usersTable.id,
        username: usersTable.username,
        fullName: usersTable.fullName,
        createdAt: usersTable.createdAt,
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
    console.log('got into login controller')
    const { username, password } = req.body
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, username))
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
    const { password, ...columns } = getTableColumns(usersTable)
    const rows = await db
      .select(columns)
      .from(usersTable)
      .where(
        and(
          like(usersTable.username, `%${req.query.query}%`),
          ne(usersTable.id, req.user!.id),
        ),
      )
      .limit(Number(req.query.limit) || 5)
      .orderBy(usersTable.username)

    res.json(rows)
  } catch (error) {
    next(error)
  }
}

export const getUser: RequestHandler = async (req, res, next) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...columns } = getTableColumns(usersTable)

    const [user] = await db
      .select(columns)
      .from(usersTable)
      .where(eq(usersTable.id, Number(req.params.userId)))
      .limit(1)
    if (!user) {
      return notFound(res, 'User')
    }
    res.json(user)
  } catch (error) {
    next(error)
  }
}
