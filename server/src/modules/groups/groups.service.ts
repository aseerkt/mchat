import { roomKeys } from '@/socket/helpers'
import { TypedIOServer } from '@/socket/socket.interface'
import { Request } from 'express'

export const handleMemberDelete = (
  req: Request,
  groupId: number,
  memberId: number,
) => {
  const io = req.app.get('io') as TypedIOServer

  io.to([
    roomKeys.CURRENT_GROUP_KEY(groupId),
    roomKeys.USER_KEY(memberId),
  ]).emit('memberLeft', {
    memberId,
    groupId,
  })

  io.in(roomKeys.USER_KEY(memberId)).socketsLeave([
    roomKeys.GROUP_KEY(groupId),
    roomKeys.CURRENT_GROUP_KEY(groupId),
  ])
}
