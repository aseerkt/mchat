import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: 'common/tables/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DB_URL!,
  },
})
