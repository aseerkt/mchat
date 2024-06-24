import { Server, Socket } from 'socket.io'
import { IMember } from '../models/Member'
import { IMessage } from '../models/Message'

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

export interface InterServerEvents {
  ping: () => void
}

export interface SocketData {
  user: {
    _id: string
    username: string
  }
}

export type TypedIOServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>

export type TypedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>
