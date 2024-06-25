import { Request } from 'express'
import {
  FilterQuery,
  Model,
  ProjectionType,
  QueryOptions,
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
  const skip = (Number(query.offset) || 0) * limit
  const results = await model.find(filters, projection, {
    ...options,
    lean: true,
    sort: { createdAt: -1 },
    limit,
    skip,
  })

  return {
    data: results,
    hasMore: results?.length === limit,
  }
}
