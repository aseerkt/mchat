import { MemberRole } from '@/modules/members/members.schema'
import { Redis } from 'ioredis'
import { config } from '../config'

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
  TYPING_USERS: (groupId: number) => `room:${groupId}:typing_users`,
  MEMBER_ROLES: (groupId: number) => `room:${groupId}:member_roles`,
}

// MEMBER

export const setMemberRole = async (
  groupId: number,
  userId: number,
  role: MemberRole,
) => {
  const cacheKey = redisKeys.MEMBER_ROLES(groupId)
  await redisClient.hset(cacheKey, userId, role)
  await redisClient.expire(cacheKey, 3600)
}
export const getMemberRole = (groupId: number, userId: number) => {
  const cacheKey = redisKeys.MEMBER_ROLES(groupId)
  return redisClient.hget(cacheKey, userId.toString())
}

export const deleteRoomMembersRoles = (groupId: number) => {
  const cacheKey = redisKeys.MEMBER_ROLES(groupId)
  return redisClient.hdel(cacheKey)
}

// ONLINE USER

export const getOnlineUsers = async () => {
  const onlineUsers = await redisClient.smembers(redisKeys.ONLINE_USERS)
  return new Set(onlineUsers)
}
export const addOnlineUser = (userId: number) => {
  return redisClient.sadd(redisKeys.ONLINE_USERS, userId)
}
export const removeOnlineUser = (userId: number) => {
  return redisClient.srem(redisKeys.ONLINE_USERS, userId)
}

// TYPING USERS

export const getTypingUsers = async (groupId: number) => {
  const typingUsers = await redisClient.hgetall(redisKeys.TYPING_USERS(groupId))

  return Object.keys(typingUsers).map(key => ({
    id: Number(key),
    username: typingUsers[key],
  }))
}
export const setTypingUser = async (
  groupId: number,
  userId: number,
  username: string,
) => {
  await redisClient.hset(redisKeys.TYPING_USERS(groupId), userId, username)
}
export const removeTypingUser = async (groupId: number, userId: number) => {
  await redisClient.hdel(redisKeys.TYPING_USERS(groupId), userId.toString())
}
