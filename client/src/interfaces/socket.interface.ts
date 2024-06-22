import { Socket } from 'socket.io-client'
import { Message } from './message.interface'

export interface ServerToClientEvents {
  newMessage: (message: Message) => void
  typingUsers: (users: { _id: string; username: string }[]) => void
}

export interface ClientToServerEvents {
  joinRoom: (roomId: string) => void
  createMessage: (
    args: { roomId: string; text: string },
    callback: (response: { data?: Message; error?: unknown }) => void,
  ) => void
  userStartedTyping: (args: {
    roomId: string
    userId: string
    username: string
  }) => void
  userStoppedTyping: (args: { roomId: string; userId: string }) => void
}

export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>
