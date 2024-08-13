import { db } from '@/database'
import { getPaginationParams, withPagination } from '@/database/helpers'
import { roomKeys } from '@/socket/helpers'
import { TypedIOServer } from '@/socket/socket.interface'
import { notAuthorized } from '@/utils/api'
import { and, desc, eq, getTableColumns, isNull, lt, or } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'
import { RequestHandler } from 'express'
import { usersTable } from '../users/users.schema'
import { messageRecipientsTable, messagesTable } from './messages.schema'
import { checkMessageOwnerShip } from './messages.service'

export const listMessages: RequestHandler = async (req, res, next) => {
  try {
    const groupId = Number(req.query.groupId)
    const partnerId = Number(req.query.partnerId)
    const { cursor, limit } = getPaginationParams(req.query, 'number')
    const parentMessageTable = alias(messagesTable, 'parentMessage')
    const parentMessageUserTable = alias(usersTable, 'parentMessageUsersTable')

    const result = await withPagination(
      db
        .select({
          ...getTableColumns(messagesTable),
          username: usersTable.username,
          parentMessage: {
            id: parentMessageTable.id,
            content: parentMessageTable.content,
            isDeleted: parentMessageTable.isDeleted,
            username: parentMessageUserTable.username,
          },
        })
        .from(messagesTable)
        .leftJoin(
          parentMessageTable,
          eq(messagesTable.parentMessageId, parentMessageTable.id),
        )
        .leftJoin(
          parentMessageUserTable,
          eq(parentMessageTable.senderId, parentMessageUserTable.id),
        )
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
                and(
                  eq(messagesTable.senderId, partnerId),
                  isNull(messagesTable.groupId),
                ),
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

export const listMessageRecipients: RequestHandler = async (req, res, next) => {
  try {
    const messageId = Number(req.params.messageId)
    const { isOwner } = await checkMessageOwnerShip(messageId, req.user!.id)

    if (!isOwner) {
      return notAuthorized(res)
    }

    const recipients = await db
      .select({
        messageId: messageRecipientsTable.messageId,
        userId: messageRecipientsTable.recipientId,
        username: usersTable.username,
        fullName: usersTable.fullName,
        readAt: messageRecipientsTable.createdAt,
      })
      .from(messageRecipientsTable)
      .innerJoin(
        usersTable,
        eq(usersTable.id, messageRecipientsTable.recipientId),
      )
      .where(eq(messageRecipientsTable.messageId, messageId))

    res.json(recipients)
  } catch (error) {
    next(error)
  }
}

export const deleteMessage: RequestHandler = async (req, res, next) => {
  try {
    const messageId = Number(req.params.messageId)
    const { isOwner, message } = await checkMessageOwnerShip(
      messageId,
      req.user!.id,
    )

    if (!isOwner) {
      return notAuthorized(res)
    }

    await db
      .update(messagesTable)
      .set({ isDeleted: true, content: 'this message has been deleted' })
      .where(eq(messagesTable.id, messageId))

    const io: TypedIOServer = req.app.get('io')

    io.to(
      message.receiverId
        ? roomKeys.CURRENT_DM_KEY(message.senderId, message.receiverId)
        : roomKeys.CURRENT_GROUP_KEY(message.groupId!),
    ).emit('messageDeleted', messageId)

    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
}
