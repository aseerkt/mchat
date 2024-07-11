import { Group } from '@/modules/groups/groups.schema'
import { Member } from '@/modules/members/members.schema'
import { Message } from '@/modules/messages/messages.schema'
import { Server, Socket } from 'socket.io'

export interface ServerToClientEvents {
  userOnline: (userId: number) => void
  userOffline: (userId: number) => void
  newMessage: (message: Message & { username: string }) => void
  newMember: (member: Member & { username: string }) => void
  newMembers: (member: Member[]) => void
  newGroup: (group: Group) => void
  messageRead: (messageId: number) => void
  groupMarkedAsRead: (groupId: number) => void
  typingUsers: (users: { id: number; username: string }[]) => void
}

export interface ClientToServerEvents {
  joinGroup: (groupId: number) => void
  createMessage: (
    args: { groupId: number; text: string },
    callback: (response: { message?: Message; error?: unknown }) => void,
  ) => void
  markMessageAsRead: (messageId: number) => void
  markGroupMessagesAsRead: (groupId: number) => void
  userStartedTyping: (groupId: number) => void
  userStoppedTyping: (groupId: number) => void
}

export interface InterServerEvents {
  ping: () => void
}

export interface SocketData {
  user: {
    id: number
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
