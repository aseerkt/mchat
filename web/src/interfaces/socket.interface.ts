import { Socket } from 'socket.io-client'
import { IMember } from '../features/member/member.interface'
import { IMessage } from '../features/message/message.interface'

export interface ServerToClientEvents {
  userOnline: (userId: number) => void
  userOffline: (userId: number) => void
  newMessage: (message: IMessage) => void
  newMember: (member: IMember) => void
  typingUsers: (users: { id: number; username: string }[]) => void
}

export interface ClientToServerEvents {
  joinRoom: (groupId: number) => void
  memberJoin: (
    groupIds: number[],
    cb: (res: { success: boolean; error?: unknown }) => void,
  ) => void
  createMessage: (
    args: { groupId: number; text: string },
    callback: (response: { message?: IMessage; error?: unknown }) => void,
  ) => void
  userStartedTyping: (groupId: number) => void
  userStoppedTyping: (groupId: number) => void
}

export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>
