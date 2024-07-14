interface UserPayload {
  id: number
  username: string
  fullName: string
}

declare namespace Express {
  export interface Request {
    user?: UserPayload
    member?: {
      groupId: number
      role: 'owner' | 'admin' | 'member'
    }
  }
}
