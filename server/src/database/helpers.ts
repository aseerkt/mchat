/* eslint-disable @typescript-eslint/ban-types */
import { isValidDate } from '@/utils/validations'
import {
  AnyColumn,
  ColumnBaseConfig,
  ColumnDataType,
  sql,
  SQL,
  SQLWrapper,
} from 'drizzle-orm'
import { PgColumn, PgSelect } from 'drizzle-orm/pg-core'
import get from 'lodash/get'

export const defaultLimit = 15

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

export const rowNumber = () => {
  return {
    over: <TReturnType>({
      partitionBy,
      orderBy,
      as,
    }: {
      partitionBy: AnyColumn | SQLWrapper
      orderBy: SQL
      as: string
    }) =>
      sql<TReturnType>`ROW_NUMBER() OVER (PARTITION BY ${partitionBy} ORDER BY ${orderBy})`.as(
        as,
      ),
  }
}

export const coalesce = <T>(
  value: SQL.Aliased<T> | SQL<T> | AnyColumn,
  defaultValue: SQL.Aliased<T> | SQL<T> | AnyColumn | number,
) => sql<T>`COALESCE (${value}, ${defaultValue})`

export const nullAs = (as: string) => sql`null`.as(as)

export const columnAs = <T>(column: AnyColumn, as: string) =>
  sql<T>`${column}`.as(as)
