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
    console.log(`Database connected: ${conn.connection.host}`.green.bold)
  } catch (error) {
    console.log(`Database connection failed`.red.bold)
    console.error(error)
    process.exit(1)
  }
}

export const findByPaginate = <TRawDocType>(
  model: Model<TRawDocType>,
  query: Request['query'],
  filters: FilterQuery<TRawDocType> = {},
  projection?: ProjectionType<TRawDocType>,
  options?: QueryOptions<TRawDocType>,
) => {
  return model.find(filters, projection, {
    ...options,
    limit: Number(query.limit) || 10,
    skip: Number(query.offset) || 0,
    sort: { createdAt: -1 },
  })
}
