import { db } from '@/database'
import { withPagination } from '@/database/helpers'
import {
  deleteGroupMembersRoles,
  getUserSockets,
  setMemberRolesForAGroup,
} from '@/redis/handlers'
import { TypedIOServer } from '@/socket/socket.inteface'
import { notFound } from '@/utils/api'
import { eq, getTableColumns, notInArray } from 'drizzle-orm'
import { RequestHandler } from 'express'
import { MemberRole, NewMember, members } from '../members/members.schema'
import { messages } from '../messages/messages.schema'
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

      const memberValues: NewMember[] = (memberIds as number[]).map(mid => ({
        groupId: group.id,
        userId: mid,
      }))

      memberValues.push({
        groupId: group.id,
        userId: req.user!.id,
        role: 'owner',
      })

      const newMembers = await tx
        .insert(members)
        .values(memberValues)
        .returning({ userId: members.userId, role: members.role })

      const userIds: number[] = []
      const memberRoles: Record<string, MemberRole> = {}

      newMembers.forEach(member => {
        if (member.userId !== req.user?.id) {
          userIds.push(member.userId)
        }
        memberRoles[member.userId] = member.role
      })

      setMemberRolesForAGroup(group.id, memberRoles)

      const userSockets = await getUserSockets(userIds)

      const io = req.app.get('io') as TypedIOServer

      io.to(userSockets).emit('newGroup', group)

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

    const result = await withPagination(
      db.select(getTableColumns(groups)).from(groups).$dynamic(),
      {
        query: req.query,
        where: userGroupIds.length
          ? notInArray(
              groups.id,
              userGroupIds.map(m => m.groupId),
            )
          : undefined,
        sortByColumn: groups.id,
      },
    )

    res.json(result)
  } catch (error) {
    next(error)
  }
}

export const listUserGroups: RequestHandler = async (req, res, next) => {
  try {
    const result = await withPagination(
      db
        .select(getTableColumns(groups))
        .from(groups)
        .innerJoin(members, eq(members.groupId, groups.id))
        .$dynamic(),
      {
        query: req.query,
        where: eq(members.userId, req.user!.id),
        sortByColumn: groups.id,
      },
    )

    res.json(result)
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
