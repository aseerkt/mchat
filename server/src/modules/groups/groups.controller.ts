import { db } from '@/database'
import {
  coalesce,
  getPaginationParams,
  nullAs,
  rowNumber,
  withPagination,
} from '@/database/helpers'
import { deleteGroupRoles, deleteMemberRole } from '@/redis/handlers'
import { getGroupRoomId } from '@/socket/helpers'
import { TypedIOServer } from '@/socket/socket.interface'
import { badRequest, notAuthorized, notFound } from '@/utils/api'
import {
  and,
  count,
  desc,
  eq,
  getTableColumns,
  isNull,
  like,
  lt,
  notExists,
  notInArray,
  or,
  sql,
} from 'drizzle-orm'
import { unionAll } from 'drizzle-orm/pg-core'
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
    const groupMessagesWithRowNumber = db
      .$with('group_messages_with_row_number')
      .as(
        db
          .select({
            ...getTableColumns(messages),
            seqNum: rowNumber().over<number>({
              partitionBy: messages.groupId,
              orderBy: desc(messages.createdAt),
              as: 'seq_num',
            }),
          })
          .from(messages),
      )

    const groupsWithLastMessage = db.$with('groups_with_last_message').as(
      db
        .with(groupMessagesWithRowNumber)
        .select({
          chatName: groups.name,
          groupId: groupMessagesWithRowNumber.groupId,
          receiverId: groupMessagesWithRowNumber.receiverId,
          lastMessage: {
            messageId: sql`${groupMessagesWithRowNumber.id}`.as('message_id'),
            content: groupMessagesWithRowNumber.content,
          },
          lastActivity: coalesce(
            groupMessagesWithRowNumber.createdAt,
            groups.createdAt,
          ).as('last_activity'),
        })
        .from(groups)
        .leftJoin(
          groupMessagesWithRowNumber,
          and(
            eq(groups.id, groupMessagesWithRowNumber.groupId),
            eq(groupMessagesWithRowNumber.seqNum, 1),
          ),
        )
        .innerJoin(members, eq(members.groupId, groups.id))
        .where(eq(members.userId, req.user!.id)),
    )

    const directMessagesWithRowNumber = db
      .$with('direct_messages_with_row_number')
      .as(
        db
          .select({
            ...getTableColumns(messages),
            seqNum: sql<number>`ROW_NUMBER() OVER (
              PARTITION BY 
                CASE 
                  WHEN ${messages.senderId} < ${messages.receiverId} 
                  THEN ${messages.senderId} 
                  ELSE ${messages.receiverId} 
                END, 
                CASE 
                  WHEN ${messages.senderId} < ${messages.receiverId} 
                  THEN ${messages.receiverId} 
                  ELSE ${messages.senderId} 
                END 
              ORDER BY ${desc(messages.createdAt)}
            )`.as('seq_num'),
          })
          .from(messages)
          .where(
            and(
              isNull(messages.groupId),
              or(
                eq(messages.senderId, req.user!.id),
                eq(messages.receiverId, req.user!.id),
              ),
            ),
          ),
      )

    const directMessagesWithLastActivity = db
      .$with('direct_messages_with_last_activity')
      .as(
        db
          .with(directMessagesWithRowNumber)
          .select({
            chatName: users.username,
            groupId: directMessagesWithRowNumber.groupId,
            receiverId: directMessagesWithRowNumber.receiverId,
            lastMessage: {
              messageId: sql`${directMessagesWithRowNumber.id}`.as(
                'message_id',
              ),
              content: directMessagesWithRowNumber.content,
            },
            lastActivity: directMessagesWithRowNumber.createdAt,
          })
          .from(directMessagesWithRowNumber)
          .innerJoin(
            users,
            eq(directMessagesWithRowNumber.receiverId, users.id),
          )
          .where(eq(directMessagesWithRowNumber.seqNum, 1)),
      )

    const unreadCounts = db.$with('unread_counts').as(
      unionAll(
        db
          .select({
            groupId: sql`${groups.id}`.as('unread_group_id'),
            receiverId: nullAs('unread_receiver_id'),
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
        db
          .select({
            groupId: nullAs('unread_group_id'),
            receiverId: sql`${messages.receiverId}`.as('unread_receiver_id'),
            unreadCount: count(messages.id).as('unread_count'),
          })
          .from(messages)
          .where(
            and(
              isNull(messages.groupId),
              eq(messages.receiverId, req.user!.id),
              notExists(
                db
                  .select()
                  .from(messageRecipients)
                  .where(
                    and(
                      eq(messageRecipients.messageId, messages.id),
                      eq(messageRecipients.recipientId, req.user!.id),
                    ),
                  ),
              ),
            ),
          )
          .groupBy(messages.receiverId),
      ),
    )

    const combinedChats = db
      .$with('combined_chats')
      .as(
        unionAll(
          db.with(groupsWithLastMessage).select().from(groupsWithLastMessage),
          db
            .with(directMessagesWithLastActivity)
            .select()
            .from(directMessagesWithLastActivity),
        ),
      )

    const qb = db
      .with(combinedChats, unreadCounts)
      .select({
        groupId: combinedChats.groupId,
        receiverId: combinedChats.receiverId,
        chatName: combinedChats.chatName,
        lastMessage: combinedChats.lastMessage,
        lastActivity: combinedChats.lastActivity,
        unreadCount: coalesce<number>(unreadCounts.unreadCount, 0)
          .mapWith(Number)
          .as('unread_count'),
      })
      .from(combinedChats)
      .leftJoin(
        unreadCounts,
        and(
          eq(combinedChats.groupId, unreadCounts.groupId),
          eq(combinedChats.receiverId, unreadCounts.receiverId),
        ),
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

export const changeMemberRole: RequestHandler = async (req, res, next) => {
  try {
    const [member] = await db
      .select({ role: members.role })
      .from(members)
      .where(
        and(
          eq(members.userId, Number(req.params.userId)),
          eq(members.groupId, Number(req.params.groupId)),
        ),
      )
      .innerJoin(users, eq(members.userId, users.id))

    if (!member) {
      return notFound(res, 'Member')
    }

    if (member.role === req.body.role) {
      return badRequest(res, 'Provide different role')
    }

    let isRoleChangePermissible = false

    // owner can promote members and demote admins
    // admin can promote existing members to admin role
    // admins cannot demote/promote existing admins
    if (req.member!.role === 'owner') {
      if (
        (member.role == 'member' && req.body.role === 'admin') ||
        (member.role === 'admin' && req.body.role === 'member')
      ) {
        isRoleChangePermissible = true
      }
    } else if (req.member?.role === 'admin' && req.body.role === 'admin') {
      isRoleChangePermissible = true
    }

    if (isRoleChangePermissible) {
      await db
        .update(members)
        .set({ role: req.body.role })
        .where(
          and(
            eq(members.userId, Number(req.params.userId)),
            eq(members.groupId, Number(req.params.groupId)),
          ),
        )
      return res.json({ message: 'Role changed successfully' })
    }
    notAuthorized(res)
  } catch (error) {
    next(error)
  }
}

// DELETE

export const deleteGroup: RequestHandler = async (req, res, next) => {
  try {
    const groupId = Number(req.params.groupId)

    await db.transaction(async tx => {
      await tx.delete(groups).where(eq(groups.id, groupId))
      await deleteGroupRoles(groupId)
    })

    // TODO: send socket io event to kick active members away from group
    const io = req.app.get('io') as TypedIOServer
    io.to(req.params.groupId).emit('groupDeleted', groupId)

    res.json({ message: 'Group deleted' })
  } catch (error) {
    next(error)
  }
}

export const leaveGroup: RequestHandler = async (req, res, next) => {
  try {
    const groupId = Number(req.params.groupId)
    const { newOwnerId } = req.body
    if (req.member?.role === 'owner') {
      if (!newOwnerId) {
        return badRequest(res, 'Please select new owner')
      }

      if (req.user!.id === newOwnerId) {
        return badRequest(res, 'Please select different member as owner')
      }
    }
    await db.transaction(async tx => {
      if (req.member?.role === 'owner') {
        await tx
          .update(members)
          .set({ role: 'owner' })
          .where(
            and(eq(members.groupId, groupId), eq(members.userId, newOwnerId)),
          )
      }

      await tx
        .delete(members)
        .where(
          and(eq(members.groupId, groupId), eq(members.userId, req.user!.id)),
        )
      await deleteMemberRole(groupId, req.user!.id)
    })
    // TODO: send socket io event to existing members
    const io = req.app.get('io') as TypedIOServer

    io.to(req.params.memberId).emit('memberLeft', {
      memberId: req.user!.id,
      groupId,
    })

    res.json({ message: 'Left the room successfully' })
  } catch (error) {
    next(error)
  }
}

export const kickMember: RequestHandler = async (req, res, next) => {
  try {
    const memberId = Number(req.params.memberId)
    const groupId = Number(req.params.groupId)
    if (req.user!.id === memberId) {
      return badRequest(res, 'Cannot kick yourself')
    }
    await db
      .delete(members)
      .where(and(eq(members.groupId, groupId), eq(members.userId, memberId)))
    await deleteMemberRole(groupId, memberId)
    // TODO: send socket io event to kicked member as well existing members
    const io = req.app.get('io') as TypedIOServer

    io.to(req.params.memberId).emit('memberLeft', { memberId, groupId })

    res.json({ message: 'Kicked member successfully' })
  } catch (error) {
    next(error)
  }
}
