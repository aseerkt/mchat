import { Redis } from 'ioredis'

let redisClient: Redis

export function getRedisClient() {
  if (!redisClient) {
    redisClient = new Redis()

    redisClient.on('connect', () => {
      console.log('Redis connected'.yellow.bold)
    })

    redisClient.on('error', (...args) => {
      console.log('Redis error: '.red.bold, ...args)
    })
  }

  return redisClient
}

export const redisKeys = {
  TYPING_USERS: (roomId: string) => `typing_users:${roomId}`,
}
