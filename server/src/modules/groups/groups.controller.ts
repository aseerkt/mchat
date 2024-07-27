import { db } from '@/database'
import {
  coalesce,
  getPaginationParams,
  nullAs,
  rowNumber,
  withPagination,
} from '@/database/helpers'
import { deleteGroupRoles, deleteMemberRole } from '@/redis/handlers'
import { roomKeys } from '@/socket/helpers'
import { TypedIOServer } from '@/socket/socket.interface'
import { badRequest, notAuthorized, notFound } from '@/utils/api'
import {
  and,
  count,
  desc,
  eq,
  getTableColumns,
  isNotNull,
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
import { membersTable } from '../members/members.schema'
import { addMembers } from '../members/members.service'
import {
  messageRecipientsTable,
  messagesTable,
} from '../messages/messages.schema'
import { usersTable } from '../users/users.schema'
import { groupsTable } from './groups.schema'

// CREATE

export const createGroup: RequestHandler = async (req, res, next) => {
  try {
    const group = await db.transaction(async tx => {
      const [group] = await tx
        .insert(groupsTable)
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
      .from(groupsTable)
      .where(eq(groupsTable.id, Number(req.params.groupId)))

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
      .select({ userId: membersTable.userId })
      .from(membersTable)
      .where(eq(membersTable.groupId, Number(req.params.groupId)))
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...columns } = getTableColumns(usersTable)
    const rows = await db
      .select(columns)
      .from(usersTable)
      .where(
        and(
          like(usersTable.username, `%${req.query.query}%`),
          notInArray(
            usersTable.id,
            groupMembers.map(m => m.userId),
          ),
        ),
      )
      .limit(Number(req.query.limit) || 5)
      .orderBy(usersTable.username)

    res.json(rows)
  } catch (error) {
    next(error)
  }
}

export const listGroups: RequestHandler = async (req, res, next) => {
  try {
    const userGroupIds = await db
      .select({ groupId: membersTable.groupId })
      .from(membersTable)
      .where(eq(membersTable.userId, req.user!.id))

    const qb = db
      .select(getTableColumns(groupsTable))
      .from(groupsTable)
      .$dynamic()

    const { cursor, limit } = getPaginationParams(req.query, 'number')

    const result = await withPagination(qb, {
      limit,
      cursorSelect: 'id',
      where: and(
        userGroupIds.length
          ? notInArray(
              groupsTable.id,
              userGroupIds.map(m => m.groupId),
            )
          : undefined,
        cursor ? lt(groupsTable.id, cursor as number) : undefined,
      ),
      orderBy: [desc(groupsTable.id)],
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
            ...getTableColumns(messagesTable),
            rowNumber: rowNumber().over<number>({
              partitionBy: messagesTable.groupId,
              orderBy: desc(messagesTable.createdAt),
              as: 'row_number',
            }),
          })
          .from(messagesTable)
          .where(isNotNull(messagesTable.groupId)),
      )

    const groupsWithLastMessage = db.$with('groups_with_last_message').as(
      db
        .with(groupMessagesWithRowNumber)
        .select({
          chatName: groupsTable.name,
          groupId: groupMessagesWithRowNumber.groupId,
          partnerId: groupMessagesWithRowNumber.receiverId,
          lastMessage: {
            messageId: sql`${groupMessagesWithRowNumber.id}`.as('message_id'),
            content: groupMessagesWithRowNumber.content,
          },
          lastActivity: coalesce(
            groupMessagesWithRowNumber.createdAt,
            groupsTable.createdAt,
          ).as('last_activity'),
        })
        .from(groupsTable)
        .leftJoin(
          groupMessagesWithRowNumber,
          and(
            eq(groupsTable.id, groupMessagesWithRowNumber.groupId),
            eq(groupMessagesWithRowNumber.rowNumber, 1),
          ),
        )
        .innerJoin(membersTable, eq(membersTable.groupId, groupsTable.id))
        .where(eq(membersTable.userId, req.user!.id)),
    )

    const directMessagesWithPartner = db
      .$with('direct_messages_with_partner')
      .as(
        db
          .select({
            ...getTableColumns(messagesTable),
            partnerId: sql<number>`
              CASE
                WHEN ${messagesTable.senderId} = ${req.user!.id} THEN ${messagesTable.receiverId}
                ELSE ${messagesTable.senderId}
              END
            `.as('partner_id'),
            rowNumber: rowNumber().over({
              partitionBy: sql<number>`
              CASE
                WHEN ${messagesTable.senderId} = ${req.user!.id} THEN ${messagesTable.receiverId}
                ELSE ${messagesTable.senderId}
              END
            `,
              orderBy: desc(messagesTable.createdAt),
              as: 'row_number',
            }),
          })
          .from(messagesTable)
          .where(
            and(
              isNull(messagesTable.groupId),
              or(
                eq(messagesTable.senderId, req.user!.id),
                eq(messagesTable.receiverId, req.user!.id),
              ),
            ),
          ),
      )

    const directMessagesWithLastActivity = db
      .$with('direct_messages_with_last_activity')
      .as(
        db
          .with(directMessagesWithPartner)
          .select({
            chatName: usersTable.username,
            groupId: directMessagesWithPartner.groupId,
            partnerId: directMessagesWithPartner.partnerId,
            lastMessage: {
              messageId: sql`${directMessagesWithPartner.id}`.as('message_id'),
              content: directMessagesWithPartner.content,
            },
            lastActivity: directMessagesWithPartner.createdAt,
          })
          .from(directMessagesWithPartner)
          .innerJoin(
            usersTable,
            eq(directMessagesWithPartner.partnerId, usersTable.id),
          )
          .where(eq(directMessagesWithPartner.rowNumber, 1)),
      )

    const unreadCounts = db.$with('unread_counts').as(
      unionAll(
        db
          .select({
            groupId: sql`${groupsTable.id}`.as('unread_group_id'),
            receiverId: nullAs('unread_receiver_id'),
            unreadCount: count(messagesTable.id).as('unread_count'),
          })
          .from(groupsTable)
          .leftJoin(messagesTable, eq(groupsTable.id, messagesTable.groupId))
          .leftJoin(
            messageRecipientsTable,
            and(
              eq(messageRecipientsTable.messageId, messagesTable.id),
              eq(messageRecipientsTable.recipientId, req.user!.id),
            ),
          )
          .where(isNull(messageRecipientsTable.messageId))
          .groupBy(groupsTable.id),
        db
          .select({
            groupId: nullAs('unread_group_id'),
            receiverId: sql`${messagesTable.receiverId}`.as(
              'unread_receiver_id',
            ),
            unreadCount: count(messagesTable.id).as('unread_count'),
          })
          .from(messagesTable)
          .where(
            and(
              isNull(messagesTable.groupId),
              eq(messagesTable.receiverId, req.user!.id),
              notExists(
                db
                  .select()
                  .from(messageRecipientsTable)
                  .where(
                    and(
                      eq(messageRecipientsTable.messageId, messagesTable.id),
                      eq(messageRecipientsTable.recipientId, req.user!.id),
                    ),
                  ),
              ),
            ),
          )
          .groupBy(messagesTable.receiverId),
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
        partnerId: combinedChats.partnerId,
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
          eq(combinedChats.partnerId, unreadCounts.receiverId),
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
      .from(groupsTable)
      .where(eq(groupsTable.id, groupId))
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

    io.to(roomKeys.CURRENT_GROUP_KEY(Number(req.params.groupId))).emit(
      'newMembers',
      newMembers,
    )

    res.json(newMembers)
  } catch (error) {
    next(error)
  }
}

export const changeMemberRole: RequestHandler = async (req, res, next) => {
  try {
    const [member] = await db
      .select({ role: membersTable.role })
      .from(membersTable)
      .where(
        and(
          eq(membersTable.userId, Number(req.params.userId)),
          eq(membersTable.groupId, Number(req.params.groupId)),
        ),
      )
      .innerJoin(usersTable, eq(membersTable.userId, usersTable.id))

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
        .update(membersTable)
        .set({ role: req.body.role })
        .where(
          and(
            eq(membersTable.userId, Number(req.params.userId)),
            eq(membersTable.groupId, Number(req.params.groupId)),
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
      await tx.delete(groupsTable).where(eq(groupsTable.id, groupId))
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
          .update(membersTable)
          .set({ role: 'owner' })
          .where(
            and(
              eq(membersTable.groupId, groupId),
              eq(membersTable.userId, newOwnerId),
            ),
          )
      }

      await tx
        .delete(membersTable)
        .where(
          and(
            eq(membersTable.groupId, groupId),
            eq(membersTable.userId, req.user!.id),
          ),
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
      .delete(membersTable)
      .where(
        and(
          eq(membersTable.groupId, groupId),
          eq(membersTable.userId, memberId),
        ),
      )
    await deleteMemberRole(groupId, memberId)
    // TODO: send socket io event to kicked member as well existing members
    const io = req.app.get('io') as TypedIOServer

    io.to(req.params.memberId).emit('memberLeft', { memberId, groupId })

    res.json({ message: 'Kicked member successfully' })
  } catch (error) {
    next(error)
  }
}
