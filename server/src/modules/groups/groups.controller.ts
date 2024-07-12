import { db } from '@/database'
import { getPaginationParams, withPagination } from '@/database/helpers'
import { deleteGroupMembersRoles } from '@/redis/handlers'
import { getGroupRoomId } from '@/socket/helpers'
import { TypedIOServer } from '@/socket/socket.interface'
import { notFound } from '@/utils/api'
import {
  and,
  count,
  desc,
  eq,
  getTableColumns,
  isNull,
  like,
  lt,
  notInArray,
  sql,
} from 'drizzle-orm'
import { RequestHandler } from 'express'
import { members } from '../members/members.schema'
import { addMembers } from '../members/members.service'
import { messageRecipients, messages } from '../messages/messages.schema'
import { users } from '../users/users.schema'
import { groups } from './groups.schema'

// CREATE

export const createGroup: RequestHandler = async (req, res, next) => {
  try {
    const group = await db.transaction(async tx => {
      const [group] = await tx
        .insert(groups)
        .values({ name: req.body.name, ownerId: req.user!.id })
        .returning()

      const { memberIds = [] } = req.body

      await addMembers(
        tx,
        req.app.get('io'),
        group,
        memberIds.concat(req.user!.id),
      )

      return group
    })
    res.status(201).json(group)
  } catch (error) {
    next(error)
  }
}

// READ

export const getGroup: RequestHandler = async (req, res, next) => {
  try {
    const [group] = await db
      .select()
      .from(groups)
      .where(eq(groups.id, Number(req.params.groupId)))

    if (!group) {
      return notFound(res, 'Group')
    }
    res.json(group)
  } catch (error) {
    next(error)
  }
}

export const listGroups: RequestHandler = async (req, res, next) => {
  try {
    const userGroupIds = await db
      .select({ groupId: members.groupId })
      .from(members)
      .where(eq(members.userId, req.user!.id))

    const qb = db.select(getTableColumns(groups)).from(groups).$dynamic()

    const { cursor, limit } = getPaginationParams(req.query, 'number')

    const result = await withPagination(qb, {
      limit,
      cursorSelect: 'id',
      where: and(
        userGroupIds.length
          ? notInArray(
              groups.id,
              userGroupIds.map(m => m.groupId),
            )
          : undefined,
        cursor ? lt(groups.id, cursor as number) : undefined,
      ),
      orderBy: [desc(groups.id)],
    })

    res.json(result)
  } catch (error) {
    next(error)
  }
}

export const listUserGroups: RequestHandler = async (req, res, next) => {
  try {
    const messagesWithSequence = db.$with('messages_with_sequence').as(
      db
        .select({
          ...getTableColumns(messages),
          seqNum:
            sql<number>`ROW_NUMBER() OVER (PARTITION BY ${messages.groupId} ORDER BY ${desc(messages.createdAt)})`.as(
              'seq_num',
            ),
        })
        .from(messages),
    )

    const groupsWithLastMessage = db.$with('groups_with_last_message').as(
      db
        .with(messagesWithSequence)
        .select({
          ...getTableColumns(groups),
          lastMessage: {
            id: sql`${messagesWithSequence.id}`.as('message_id'),
            content: messagesWithSequence.content,
            senderId: messagesWithSequence.senderId,
          },
          lastActivity:
            sql<string>`COALESCE (${messagesWithSequence.createdAt}, ${groups.createdAt})`.as(
              'last_activity',
            ),
        })
        .from(groups)
        .leftJoin(
          messagesWithSequence,
          and(
            eq(groups.id, messagesWithSequence.groupId),
            eq(messagesWithSequence.seqNum, 1),
          ),
        )
        .innerJoin(members, eq(members.groupId, groups.id))
        .where(eq(members.userId, req.user!.id)),
    )

    const unreadCounts = db.$with('unread_counts').as(
      db
        .select({
          groupId: groups.id,
          unreadCount: count(messages.id).as('unread_count'),
        })
        .from(groups)
        .leftJoin(messages, eq(groups.id, messages.groupId))
        .leftJoin(
          messageRecipients,
          and(
            eq(messageRecipients.messageId, messages.id),
            eq(messageRecipients.recipientId, req.user!.id),
          ),
        )
        .where(isNull(messageRecipients.messageId))
        .groupBy(groups.id),
    )

    const qb = db
      .with(groupsWithLastMessage, unreadCounts)
      .select({
        lastMessage: groupsWithLastMessage.lastMessage,
        lastActivity: groupsWithLastMessage.lastActivity,
        id: groupsWithLastMessage.id,
        name: groupsWithLastMessage.name,
        unreadCount: sql<number>`COALESCE (${unreadCounts.unreadCount}, 0)`
          .mapWith(Number)
          .as('unread_count'),
      })
      .from(groupsWithLastMessage)
      .leftJoin(
        unreadCounts,
        eq(unreadCounts.groupId, groupsWithLastMessage.id),
      )
      .$dynamic()

    const { cursor, limit } = getPaginationParams(req.query, 'date')

    const result = await withPagination(qb, {
      cursorSelect: 'lastActivity',
      orderBy: [desc(groupsWithLastMessage.lastActivity)],
      where: cursor
        ? lt(groupsWithLastMessage.lastActivity, cursor)
        : undefined,
      limit,
    })

    res.json(result)
  } catch (error) {
    next(error)
  }
}

// UPDATE

export const addGroupMembers: RequestHandler = async (req, res, next) => {
  try {
    const groupId = Number(req.params.groupId)
    const [group] = await db
      .select()
      .from(groups)
      .where(eq(groups.id, groupId))
      .limit(1)

    if (!group) {
      return notFound(res, 'Group')
    }

    const newMembers = await addMembers(
      db,
      req.app.get('io'),
      group,
      req.body.memberIds || [],
    )

    const io = req.app.get('io') as TypedIOServer

    // let existing members know new member is joined

    io.to(getGroupRoomId(req.params.groupId)).emit('newMembers', newMembers)

    res.json(newMembers)
  } catch (error) {
    next(error)
  }
}

// DELETE

export const deleteGroup: RequestHandler = async (req, res, next) => {
  try {
    const groupId = Number(req.params.groupId)
    const result = await db.delete(groups).where(eq(groups.id, groupId))

    if (!result.rowCount) {
      return notFound(res, 'Group')
    }

    // TODO: move these db operations to queue
    await deleteGroupMembersRoles(groupId)
    await db.delete(messages).where(eq(messages.groupId, groupId))
    await db.delete(members).where(eq(members.groupId, groupId))

    res.json({ message: 'Group deleted' })
  } catch (error) {
    next(error)
  }
}

export const getNonGroupMembers: RequestHandler = async (req, res, next) => {
  try {
    const groupMembers = await db
      .select({ userId: members.userId })
      .from(members)
      .where(eq(members.groupId, Number(req.params.groupId)))
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...columns } = getTableColumns(users)
    const rows = await db
      .select(columns)
      .from(users)
      .where(
        and(
          like(users.username, `%${req.query.query}%`),
          notInArray(
            users.id,
            groupMembers.map(m => m.userId),
          ),
        ),
      )
      .limit(Number(req.query.limit) || 5)
      .orderBy(users.username)

    res.json(rows)
  } catch (error) {
    next(error)
  }
}
