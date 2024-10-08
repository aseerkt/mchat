import { Server, Socket } from 'socket.io'
import { Group } from '../tables/groups.table'
import { Member } from '../tables/members.table'
import { Message } from '../tables/messages.table'

export type ChatMode = 'group' | 'direct'

export interface ServerToClientEvents {
  userOnline: (userId: number) => void
  userOffline: (userId: number) => void
  newMessage: (
    message: Message & { username: string; chatName: string },
  ) => void
  newMember: (member: Member & { username: string }) => void
  newMembers: (member: Member[]) => void
  memberLeft: (args: { groupId: number; memberId: number }) => void
  newGroup: (group: Group) => void
  groupDeleted: (groupId: number) => void
  messageRead: (messageId: number) => void
  messageDeleted: (messageId: number) => void
  chatMarkedAsRead: (args: { groupId?: number; partnerId?: number }) => void
  typingUsers: (users: { id: number; username: string }[]) => void
}

export interface ClientToServerEvents {
  joinGroup: (groupId: number) => void
  joinDm: (partnerId: number) => void
  createMessage: (
    args: {
      groupId?: number
      receiverId?: number
      text: string
      parentMessageId?: number
    },
    callback: (response: { message?: Message; error?: unknown }) => void,
  ) => void
  markMessageAsRead: (messageId: number) => void
  markChatMessagesAsRead: (args: {
    groupId?: number
    partnerId?: number
  }) => void
  typing: (args: { chatId: number; mode: ChatMode; isTyping: boolean }) => void
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
