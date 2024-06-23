import { Redis } from 'ioredis'
import { config } from '../config'
import { MemberRole } from '../models/Member'

let redisClient: Redis

export function getRedisClient() {
  if (!redisClient) {
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

getRedisClient()

// REDIS KEYS

export const redisKeys = {
  ONLINE_USERS: 'online_users',
  TYPING_USERS: (roomId: string) => `room:${roomId}:typing_users`,
  MEMBER_ROLES: (roomId: string) => `room:${roomId}:member_roles`,
}

// MEMBER

export const setMemberRole = async (
  roomId: string,
  userId: string,
  role: MemberRole,
) => {
  const cacheKey = redisKeys.MEMBER_ROLES(roomId)
  await redisClient.hset(cacheKey, userId, role)
  await redisClient.expire(cacheKey, 3600)
}
export const getMemberRole = (roomId: string, userId: string) => {
  const cacheKey = redisKeys.MEMBER_ROLES(roomId)
  return redisClient.hget(cacheKey, userId)
}

export const deleteRoomMembersRoles = (roomId: string) => {
  const cacheKey = redisKeys.MEMBER_ROLES(roomId)
  return redisClient.hdel(cacheKey)
}

// ONLINE USER

export const getOnlineUsers = async (userIds: string[]) => {
  const onlineUsers = await redisClient.smembers(redisKeys.ONLINE_USERS)
  return new Set(onlineUsers)
}
export const addOnlineUser = (userId: string) => {
  return redisClient.sadd(redisKeys.ONLINE_USERS, userId)
}
export const removeOnlineUser = (userId: string) => {
  return redisClient.srem(redisKeys.ONLINE_USERS, userId)
}

// TYPING USERS

export const getTypingUsers = async (roomId: string) => {
  const typingUsers = await redisClient.hgetall(redisKeys.TYPING_USERS(roomId))

  return Object.keys(typingUsers).map(key => ({
    _id: key,
    username: typingUsers[key],
  }))
}
export const setTypingUser = async (
  roomId: string,
  userId: string,
  username: string,
) => {
  await redisClient.hset(redisKeys.TYPING_USERS(roomId), userId, username)
}
export const removeTypingUser = async (roomId: string, userId: string) => {
  await redisClient.hdel(redisKeys.TYPING_USERS(roomId), userId)
}
