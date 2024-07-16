import { MemberRole } from '@/modules/members/members.schema'
import { ChatMode } from '@/socket/socket.interface'
import { getRedisClient } from '.'

const redisClient = getRedisClient()

// REDIS KEYS

export const redisKeys = {
  ONLINE_USERS: 'online_users',
  SOCKET_MAP: (userId: number) => `user:${userId}:sockets`,
  TYPING_USERS: (chatId: number, mode: ChatMode) =>
    `typing_users:${mode}:${chatId}:`,
  MEMBER_ROLES: (groupId: number) => `group:${groupId}:member_roles`,
}

// MEMBER ROLES

export const setGroupMemberRoleTxn = (
  groupMemberRoles: Record<string, [number, MemberRole]>,
) => {
  const pipe = redisClient.pipeline()

  for (const [groupId, roles] of Object.entries(groupMemberRoles)) {
    const cacheKey = redisKeys.MEMBER_ROLES(Number(groupId))
    pipe.hset(cacheKey, roles[0], roles[1])
    pipe.expire(cacheKey, 3600)
  }

  return pipe.exec()
}

export const setMemberRolesForAGroup = async (
  groupId: number,
  roles: Record<string, MemberRole>,
) => {
  const cacheKey = redisKeys.MEMBER_ROLES(groupId)
  await redisClient.hset(cacheKey, roles)
  await redisClient.expire(cacheKey, 3600)
}
export const getMemberRole = (groupId: number, userId: number) => {
  const cacheKey = redisKeys.MEMBER_ROLES(groupId)
  return redisClient.hget(cacheKey, userId.toString())
}

export const deleteGroupRoles = (groupId: number) => {
  const cacheKey = redisKeys.MEMBER_ROLES(groupId)
  return redisClient.hdel(cacheKey, '*')
}

export const deleteMemberRole = (groupId: number, memberId: number) => {
  const cacheKey = redisKeys.MEMBER_ROLES(groupId)
  return redisClient.hdel(cacheKey, memberId.toString())
}

// ONLINE USER

export const getOnlineUsers = async () => {
  const onlineUsers = await redisClient.smembers(redisKeys.ONLINE_USERS)
  return new Set(onlineUsers)
}
export const markUserOnline = (userId: number) => {
  return redisClient.sadd(redisKeys.ONLINE_USERS, userId)
}
export const markUserOffline = (userId: number) => {
  return redisClient.srem(redisKeys.ONLINE_USERS, userId)
}

export const checkOnlineUsers = async (userIds: number[]) => {
  // redis: array of 1, 0
  // dragonfly: array of '1', '0'
  return redisClient.smismember(redisKeys.ONLINE_USERS, userIds)
}

// TYPING USERS

export const getTypingUsers = async (chatId: number, mode: ChatMode) => {
  const typingUsers = await redisClient.hgetall(
    redisKeys.TYPING_USERS(chatId, mode),
  )

  return Object.keys(typingUsers).map(key => ({
    id: Number(key),
    username: typingUsers[key],
  }))
}
export const setTypingUser = async ({
  chatId,
  mode,
  userId,
  username,
}: {
  chatId: number
  mode: ChatMode
  userId: number
  username: string
}) => {
  const cacheKey = redisKeys.TYPING_USERS(chatId, mode)
  await redisClient.hset(cacheKey, userId, username)
  await redisClient.expire(cacheKey, 180) // 3 minutes expiry
}
export const removeTypingUser = async ({
  chatId,
  mode,
  userId,
}: {
  chatId: number
  mode: ChatMode
  userId: number
}) => {
  await redisClient.hdel(
    redisKeys.TYPING_USERS(chatId, mode),
    userId.toString(),
  )
}

// USER SOCKETS

export const addUserSocket = async (userId: number, socketId: string) => {
  return redisClient.sadd(redisKeys.SOCKET_MAP(userId), socketId)
}

export const removeUserSocket = async (userId: number, socketId: string) => {
  return redisClient.srem(redisKeys.SOCKET_MAP(userId), socketId)
}

export const getUserSockets = async (userId: number) => {
  return redisClient.smembers(redisKeys.SOCKET_MAP(userId))
}

export const getMultipleUserSockets = async (userIds: number[]) => {
  if (!userIds.length) return []
  return redisClient.sunion(userIds.map(uid => redisKeys.SOCKET_MAP(uid)))
}
