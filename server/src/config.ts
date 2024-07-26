import 'dotenv/config'

export const config = {
  appName: 'mChat',
  port: process.env.PORT || 5000,
  jwtKey: 'jwt',
  accessTokenExpiry: '15m',
  refreshTokenExpiry: '7d',
  refreshTokenMaxAge: 7 * 24 * 60 * 60 * 1000,
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET || 'verycomplexsecret',
  refreshTokenSecret:
    process.env.REFRESH_TOKEN_SECRET || 'eventmorecomplexsecret',
  dbUrl: process.env.DB_URL!,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  isProd: process.env.NODE_ENV === 'production',
  redisHost: process.env.REDIS_HOST || 'localhost',
  redisPort: process.env.REDIS_PORT || 6379,
}
