/* eslint-disable @typescript-eslint/ban-types */
import { isValidDate } from '@/utils/validations'
import { ColumnBaseConfig, ColumnDataType, SQL } from 'drizzle-orm'
import { PgColumn, PgSelect } from 'drizzle-orm/pg-core'
import get from 'lodash/get'
import { defaultLimit } from './constants'

export const getPaginationParams = (
  query: Record<string, unknown>,
  cursorDataType: 'number' | 'string' | 'date' = 'string',
) => {
  let cursor

  switch (cursorDataType) {
    case 'number':
      cursor = Number(query.cursor) || null
      break
    case 'date':
      cursor = isValidDate(query.cursor)
        ? new Date(query.cursor as string)
        : null
      break
    case 'string':
    default:
      cursor = query.cursor
      break
  }

  return { cursor, limit: Number(query.limit) || defaultLimit }
}

export const withPagination = async <T extends PgSelect>(
  qb: T,
  {
    limit = defaultLimit,
    cursorSelect,
    where,
    orderBy,
  }: {
    limit?: number
    cursorSelect: keyof T['_']['result'][0]
    where?:
      | SQL<unknown>
      | ((aliases: T['_']['selection']) => SQL<unknown> | undefined)
      | undefined
    orderBy: (
      | SQL<unknown>
      | PgColumn<ColumnBaseConfig<ColumnDataType, string>, {}, {}>
      | SQL.Aliased<unknown>
    )[]
  },
) => {
  const paginatedQb = qb
    .where(where)
    .limit(limit)
    .orderBy(...orderBy)

  const result = await paginatedQb

  return {
    data: result,
    cursor:
      result.length === limit
        ? get(result[result.length - 1], cursorSelect)
        : null,
  }
}
