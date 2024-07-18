export const currentGroupRoomPrefix = 'current_group'
export const currentDmRoomPrefix = 'current_dm'

const orderedId = (id1: number, id2: number, separator = ':') =>
  [id1, id2].sort().join(separator)

export const roomKeys = {
  GROUP_KEY: (groupId: number) => `group:${groupId}`,
  CURRENT_GROUP_KEY: (groupId: number) =>
    `${currentGroupRoomPrefix}:${groupId}`,
  CURRENT_DM_KEY: (senderId: number, receiverId: number) =>
    `${currentDmRoomPrefix}:${orderedId(senderId, receiverId)}`,
  USER_KEY: (userId: number) => `user:${userId}`,
}
