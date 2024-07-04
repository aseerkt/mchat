import { config } from '@/config'
import Redis from 'ioredis'

let redisClient: Redis

export function getRedisClient() {
  if (!redisClient) {
    process.env.DEBUG = config.isProd ? '' : 'ioredis:*'
    redisClient = new Redis({
      host: config.redisHost,
      port: Number(config.redisPort),
    })

    redisClient.on('connect', () => {
      console.log('Redis connected'.yellow.bold)
    })

    redisClient.on('error', (...args) => {
      console.log('Redis error: '.red.bold, ...args)
    })
  }

  return redisClient
}