import { IMessage } from '../models/Message'

export interface ServerToClientEvents {
  newMessage: (message: IMessage) => void
  typingUsers: (users: { _id: string; username: string }[]) => void
}

export interface ClientToServerEvents {
  joinRoom: (roomId: string) => void
  createMessage: (args: { roomId: string; text: string }) => void
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
