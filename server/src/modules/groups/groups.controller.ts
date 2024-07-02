import { db } from '@/database'
import { withPagination } from '@/database/helpers'
import { notFound } from '@/utils/api'
import { deleteRoomMembersRoles, setMemberRole } from '@/utils/redis'
import { eq, getTableColumns, ne } from 'drizzle-orm'
import { RequestHandler } from 'express'
import { members } from '../members/members.schema'
import { messages } from '../messages/messages.schema'
import { groups } from './groups.schema'

export const createGroup: RequestHandler = async (req, res, next) => {
  try {
    const group = await db.transaction(async tx => {
      const [group] = await tx
        .insert(groups)
        .values({ name: req.body.name, ownerId: req.user!.id })
        .returning()
      await tx
        .insert(members)
        .values({ groupId: group.id, userId: req.user!.id, role: 'owner' })
      await setMemberRole(group.id, req.user!.id, 'owner')
      return group
    })
    res.status(201).json(group)
  } catch (error) {
    next(error)
  }
}

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
    const result = await withPagination(
      db
        .selectDistinct(getTableColumns(groups))
        .from(groups)
        .innerJoin(members, eq(members.groupId, groups.id))
        .$dynamic(),
      {
        query: req.query,
        where: ne(members.userId, req.user!.id),
        sortByColumn: groups.id,
      },
    )

    res.json(result)
  } catch (error) {
    next(error)
  }
}

export const deleteGroup: RequestHandler = async (req, res, next) => {
  try {
    const groupId = Number(req.params.groupId)
    const result = await db.delete(groups).where(eq(groups.id, groupId))

    if (!result.rowCount) {
      return notFound(res, 'Group')
    }

    // TODO: move these db operations to queue
    await deleteRoomMembersRoles(groupId)
    await db.delete(messages).where(eq(messages.groupId, groupId))
    await db.delete(members).where(eq(members.groupId, groupId))

    res.json({ message: 'Group deleted' })
  } catch (error) {
    next(error)
  }
}

export const listUserGroups: RequestHandler = async (req, res, next) => {
  try {
    const result = await withPagination(
      db
        .selectDistinct(getTableColumns(groups))
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
