export const config = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || 'verycomplexsecret',
  mongoUri: process.env.MONGO_URI!,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  isProd: process.env.NODE_ENV === 'production',
}
