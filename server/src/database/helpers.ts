import { isValidDate } from '@/utils/validations'
import { AnyColumn, SQL, and, asc, desc, gt, lt, sql } from 'drizzle-orm'
import { PgSelect, bigserial, timestamp } from 'drizzle-orm/pg-core'

interface WithPaginateOptions {
  query: Record<string, unknown>
  sortByColumn: AnyColumn
  sortDirection?: 'asc' | 'desc'
  where?: SQL<unknown>
}

export const withPagination = async <T extends PgSelect>(
  qb: T,
  { query, sortByColumn, sortDirection = 'desc', where }: WithPaginateOptions,
) => {
  const limit = Number(query.limit) > 20 ? 10 : Number(query.limit)
  let cursor

  switch (sortByColumn.dataType) {
    case 'number':
      cursor = Number(query.cursor)
      break
    case 'date':
      cursor = isValidDate(query.cursor)
        ? new Date(query.cursor as string)
        : null
      break
    default:
      cursor = query.cursor
  }

  const orderWhere =
    sortDirection === 'asc'
      ? gt(sortByColumn, cursor)
      : lt(sortByColumn, cursor)
  const orderBy =
    sortDirection === 'asc' ? asc(sortByColumn) : desc(sortByColumn)

  const result = await qb
    .where(cursor ? and(orderWhere, where) : where)
    .limit(limit)
    .orderBy(orderBy)

  return {
    data: result,
    cursor:
      result.length === limit
        ? result[result.length - 1][sortByColumn.name]
        : null,
  }
}

export const commonSchemaFields = {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => sql`now()`),
}
