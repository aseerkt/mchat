import { Request } from 'express'
import {
  FilterQuery,
  Model,
  ProjectionType,
  QueryOptions,
  Types,
  connect,
} from 'mongoose'
import { config } from '../config'

export const connectDB = async () => {
  try {
    const conn = await connect(config.mongoUri, {
      authSource: 'admin',
    })
    conn.set('debug', !config.isProd)
    console.log(`Database connected: ${conn.connection.host}`.green.bold)
  } catch (error) {
    console.log(`Database connection failed`.red.bold)
    console.error(error)
    process.exit(1)
  }
}

export async function findByPaginate<TRawDocType>(
  model: Model<TRawDocType>,
  query: Request['query'],
  filters: FilterQuery<TRawDocType> = {},
  projection?: ProjectionType<TRawDocType>,
  options?: QueryOptions<TRawDocType>,
) {
  const limit = Number(query.limit) || 15

  const cursor =
    typeof query.cursor === 'string' && Types.ObjectId.isValid(query.cursor)
      ? new Types.ObjectId(query.cursor)
      : undefined
  const offsetWhere = cursor ? { _id: { $lt: cursor, ...filters._id } } : {}

  const results = await model.find({ ...filters, ...offsetWhere }, projection, {
    ...options,
    lean: true,
    sort: { _id: -1 },
    limit,
  })

  const hasMore = results?.length === limit

  return {
    data: results,
    hasMore,
    cursor: hasMore ? results[results.length - 1]._id : '',
  }
}
