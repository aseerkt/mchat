import { db } from '@/database'
import { withPagination } from '@/database/helpers'
import { eq, getTableColumns } from 'drizzle-orm'
import { RequestHandler } from 'express'
import { users } from '../users/users.schema'
import { messages } from './messages.schema'

export const createMessage: RequestHandler = async (req, res, next) => {
  try {
    const [message] = await db
      .insert(messages)
      .values({
        groupId: req.body.groupId,
        content: req.body.text,
        senderId: req.user!.id,
      })
      .returning()
    res.status(201).json(message)
  } catch (error) {
    next(error)
  }
}

export const listMessages: RequestHandler = async (req, res, next) => {
  try {
    const result = await withPagination(
      db
        .select({ ...getTableColumns(messages), username: users.username })
        .from(messages)
        .innerJoin(users, eq(messages.senderId, users.id))
        .$dynamic(),
      {
        query: req.query,
        where: eq(messages.groupId, Number(req.params.groupId)),
        sortByColumn: messages.id,
      },
    )

    res.json(result)
  } catch (error) {
    next(error)
  }
}
