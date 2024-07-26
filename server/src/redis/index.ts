import { config } from '@/config'

if (!config.isProd) {
  process.env.DEBUG = 'ioredis:*'
}

import Redis from 'ioredis'

let redisClient: Redis

export function getRedisClient() {
  if (!redisClient) {
    redisClient = new Redis({
      host: config.redisHost,
      port: +config.redisPort,
    })

    redisClient.on('connect', () => {
      console.log('DragonflyDB connected'.yellow.bold)
    })

    redisClient.on('error', (...args) => {
      console.log('DragonflyDB error: '.red.bold, ...args)
    })
  }

  return redisClient
}
