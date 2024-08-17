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
import { badRequest, notAuthorized, notFound } from '@/utils/api'
import { TypedIOServer } from 'common/socket'
import {
  groupsTable,
  membersTable,
  messageRecipientsTable,
  messagesTable,
  usersTable,
} from 'common/tables'
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
  ne,
  notExists,
  notInArray,
  or,
  sql,
} from 'drizzle-orm'
import { union } from 'drizzle-orm/pg-core'
import { RequestHandler } from 'express'
import { addMembers } from '../members/members.service'
import { handleMemberDelete } from './groups.service'

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

export const listUserChats: RequestHandler = async (req, res, next) => {
  try {
    const userGroups = db
      .$with('user_groups')
      .as(
        db
          .select(getTableColumns(groupsTable))
          .from(groupsTable)
          .innerJoin(membersTable, eq(membersTable.groupId, groupsTable.id))
          .where(eq(membersTable.userId, req.user!.id)),
      )

    const groupMessagesWithRowNumber = db
      .$with('group_messages_with_row_number')
      .as(
        db
          .with(userGroups)
          .select({
            ...getTableColumns(messagesTable),
            rowNumber: rowNumber().over<number>({
              partitionBy: messagesTable.groupId,
              orderBy: desc(messagesTable.createdAt),
              as: 'row_number',
            }),
          })
          .from(messagesTable)
          .innerJoin(userGroups, eq(userGroups.id, messagesTable.groupId))
          .where(isNotNull(messagesTable.groupId)),
      )

    const userGroupsWithLastMessage = db.$with('groups_with_last_message').as(
      db
        .select({
          chatName: userGroups.name,
          groupId: groupMessagesWithRowNumber.groupId,
          partnerId: groupMessagesWithRowNumber.receiverId,
          lastMessage: {
            messageId: sql`${groupMessagesWithRowNumber.id}`.as('message_id'),
            content: groupMessagesWithRowNumber.content,
          },
          lastActivity: coalesce(
            groupMessagesWithRowNumber.createdAt,
            userGroups.createdAt,
          ).as('last_activity'),
        })
        .from(userGroups)
        .leftJoin(
          groupMessagesWithRowNumber,
          and(
            eq(userGroups.id, groupMessagesWithRowNumber.groupId),
            eq(groupMessagesWithRowNumber.rowNumber, 1),
          ),
        ),
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
      union(
        db
          .select({
            groupId: sql`${userGroups.id}`.as('unread_group_id'),
            partnerId: nullAs('unread_partner_id'),
            unreadCount: count(messagesTable.id).as('unread_count'),
          })
          .from(userGroups)
          .leftJoin(
            messagesTable,
            and(
              eq(messagesTable.groupId, userGroups.id),
              ne(messagesTable.senderId, req.user!.id),
            ),
          )
          .leftJoin(
            messageRecipientsTable,
            and(
              eq(messageRecipientsTable.messageId, messagesTable.id),
              eq(messageRecipientsTable.recipientId, req.user!.id),
            ),
          )
          .where(isNull(messageRecipientsTable.messageId))
          .groupBy(userGroups.id),
        db
          .select({
            groupId: nullAs('unread_group_id'),
            partnerId: sql`${messagesTable.senderId}`.as('unread_partner_id'),
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
          .groupBy(messagesTable.senderId),
      ),
    )

    const combinedChats = db
      .$with('combined_chats')
      .as(
        union(
          db.select().from(userGroupsWithLastMessage),
          db.select().from(directMessagesWithLastActivity),
        ),
      )

    const qb = db
      .with(
        userGroups,
        groupMessagesWithRowNumber,
        userGroupsWithLastMessage,
        directMessagesWithPartner,
        directMessagesWithLastActivity,
        combinedChats,
        unreadCounts,
      )
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
        or(
          eq(combinedChats.groupId, unreadCounts.groupId),
          eq(combinedChats.partnerId, unreadCounts.partnerId),
        ),
      )
      .$dynamic()

    const { cursor, limit } = getPaginationParams(req.query, 'date')

    const result = await withPagination(qb, {
      cursorSelect: 'lastActivity',
      orderBy: [desc(userGroupsWithLastMessage.lastActivity)],
      where: cursor
        ? lt(userGroupsWithLastMessage.lastActivity, cursor)
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

    const io = req.app.get('io') as TypedIOServer
    io.to(roomKeys.GROUP_KEY(groupId)).emit('groupDeleted', groupId)
    const roomsToDelete = [
      roomKeys.GROUP_KEY(groupId),
      roomKeys.CURRENT_GROUP_KEY(groupId),
    ]
    io.in(roomsToDelete).socketsLeave(roomsToDelete)

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
    handleMemberDelete(req, groupId, req.user!.id)

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
    handleMemberDelete(req, groupId, memberId)

    res.json({ message: 'Kicked member successfully' })
  } catch (error) {
    next(error)
  }
}
