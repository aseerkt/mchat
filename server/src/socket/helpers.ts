import { groupRoomPrefix } from './events'

export const getGroupRoomId = (groupId: number | string) =>
  `${groupRoomPrefix}:${groupId}`
