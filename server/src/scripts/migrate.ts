import 'module-alias/register'

import 'colors'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { client, connectDB, db } from '../database'

const runMigration = async () => {
  try {
    await connectDB()
    console.info('Migration started...'.blue.bold)
    await migrate(db, { migrationsFolder: './drizzle' })
    console.info('Migration success'.green)
    await client.end()
    process.exit(0)
  } catch (error) {
    console.error('Migration failed: '.red.bold, error)
    await client.end()
    process.exit(1)
  }
}

runMigration()
