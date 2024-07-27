import { db } from '@/database'
import { getPaginationParams, withPagination } from '@/database/helpers'
import { and, desc, eq, getTableColumns, lt, or } from 'drizzle-orm'
import { RequestHandler } from 'express'
import { usersTable } from '../users/users.schema'
import { messagesTable } from './messages.schema'

export const createMessage: RequestHandler = async (req, res, next) => {
  try {
    const [message] = await db
      .insert(messagesTable)
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
        .select({
          ...getTableColumns(messagesTable),
          username: usersTable.username,
        })
        .from(messagesTable)
        .innerJoin(usersTable, eq(messagesTable.senderId, usersTable.id))
        .$dynamic(),
      {
        limit,
        cursorSelect: 'id',
        orderBy: [desc(messagesTable.id)],
        where: and(
          groupId ? eq(messagesTable.groupId, groupId) : undefined,
          partnerId
            ? or(
                eq(messagesTable.receiverId, partnerId),
                eq(messagesTable.senderId, partnerId),
              )
            : undefined,
          cursor ? lt(messagesTable.id, cursor as number) : undefined,
        ),
      },
    )

    res.json(result)
  } catch (error) {
    next(error)
  }
}
