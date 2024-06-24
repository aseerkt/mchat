import { Socket } from 'socket.io-client'
import { IMember } from './member.inteface'
import { IMessage } from './message.interface'

export interface ServerToClientEvents {
  userOnline: (userId: string) => void
  userOffline: (userId: string) => void
  newMessage: (message: IMessage) => void
  newMember: (member: IMember) => void
  typingUsers: (users: { _id: string; username: string }[]) => void
}

export interface ClientToServerEvents {
  joinRoom: (roomId: string) => void
  memberJoin: (
    roomIds: string[],
    cb: (res: { success: boolean; error?: unknown }) => void,
  ) => void
  createMessage: (
    args: { roomId: string; text: string },
    callback: (response: { message?: IMessage; error?: unknown }) => void,
  ) => void
  userStartedTyping: (roomId: string) => void
  userStoppedTyping: (roomId: string) => void
}

export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>
