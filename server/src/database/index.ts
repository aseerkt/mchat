import { drizzle } from 'drizzle-orm/node-postgres'
import { Client } from 'pg'
import { config } from '../config'

export const client = new Client({
  connectionString: config.dbUrl,
})

export const connectDB = async () => {
  try {
    await client.connect()
    console.log('DB connected successfully'.green.bold)
  } catch (error) {
    console.log('DB connection failed'.red.bold)
    console.error(error)
    process.exit(1)
  }
}

export const db = drizzle(client, { logger: !config.isProd })
