import { db } from '@/database'
import { getPaginationParams, withPagination } from '@/database/helpers'
import { and, desc, eq, getTableColumns, lt, or } from 'drizzle-orm'
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
    const groupId = Number(req.query.groupId)
    const partnerId = Number(req.query.partnerId)
    const { cursor, limit } = getPaginationParams(req.query, 'number')
    const result = await withPagination(
      db
        .select({ ...getTableColumns(messages), username: users.username })
        .from(messages)
        .innerJoin(users, eq(messages.senderId, users.id))
        .$dynamic(),
      {
        limit,
        cursorSelect: 'id',
        orderBy: [desc(messages.id)],
        where: and(
          groupId ? eq(messages.groupId, groupId) : undefined,
          partnerId
            ? or(
                eq(messages.receiverId, partnerId),
                eq(messages.senderId, partnerId),
              )
            : undefined,
          cursor ? lt(messages.id, cursor as number) : undefined,
        ),
      },
    )

    res.json(result)
  } catch (error) {
    next(error)
  }
}
