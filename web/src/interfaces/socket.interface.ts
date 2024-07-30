import { ChatMode } from '@/features/chat/chat.interface'
import { IGroup } from '@/features/group/group.interface'
import { Socket } from 'socket.io-client'
import { IMember } from '../features/member/member.interface'
import { IMessage } from '../features/message/message.interface'

export interface ServerToClientEvents {
  userOnline: (userId: number) => void
  userOffline: (userId: number) => void
  newMessage: (message: IMessage & { chatName: string }) => void
  newMember: (member: IMember) => void
  newMembers: (member: IMember[]) => void
  memberLeft: (args: { groupId: number; memberId: number }) => void
  newGroup: (group: IGroup) => void
  groupDeleted: (groupId: number) => void
  messageRead: (messageId: number) => void
  messageDeleted: (messageId: number) => void
  chatMarkedAsRead: (args: { groupId?: number; receiverId?: number }) => void
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
    callback: (response: { message?: IMessage; error?: unknown }) => void,
  ) => void
  markMessageAsRead: (messageId: number) => void
  markChatMessagesAsRead: (args: {
    groupId?: number
    receiverId?: number
  }) => void
  typing: (args: { chatId: number; mode: ChatMode; isTyping: boolean }) => void
}

export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>
