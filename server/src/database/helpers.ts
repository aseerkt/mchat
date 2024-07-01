import {
  AnyColumn,
  SQL,
  SQLWrapper,
  and,
  asc,
  desc,
  lt,
  sql,
} from 'drizzle-orm'
import { PgSelect, bigserial, timestamp } from 'drizzle-orm/pg-core'

export const withPagination = async <T extends PgSelect>(
  qb: T,
  query: Record<string, unknown>,
  orderBy: SQLWrapper | AnyColumn,
  order: 'asc' | 'desc' = 'desc',
  where?: SQL<unknown>,
) => {
  const limit = Number(query.limit) > 20 ? 10 : Number(query.limit)
  const cursor = Number(query.cursor)

  const result = await qb
    .where(cursor ? and(lt(orderBy, cursor), where) : where)
    .limit(limit)
    .orderBy(order === 'asc' ? asc(orderBy) : desc(orderBy))

  return {
    data: result,
    cursor: result.length === limit ? result[result.length - 1].id : null,
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
