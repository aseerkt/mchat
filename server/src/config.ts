import 'dotenv/config'

export const config = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || 'verycomplexsecret',
  dbUrl: process.env.DB_URL!,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  isProd: process.env.NODE_ENV === 'production',
  redisHost: process.env.REDIS_HOST || 'localhost',
  redisPort: process.env.REDIS_PORT || 6379,
}
