import { Server, Socket } from 'socket.io'
import { IMessage } from '../models/Message'

export interface ServerToClientEvents {
  newMessage: (message: IMessage) => void
  typingUsers: (users: { _id: string; username: string }[]) => void
}

export interface ClientToServerEvents {
  joinRoom: (roomId: string) => void
  createMessage: (
    args: { roomId: string; text: string },
    callback: (response: { data?: IMessage; error?: unknown }) => void,
  ) => void
  userStartedTyping: (args: {
    roomId: string
    userId: string
    username: string
  }) => void
  userStoppedTyping: (args: { roomId: string; userId: string }) => void
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
