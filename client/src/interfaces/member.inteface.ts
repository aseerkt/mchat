export interface Member {
  roomId: string
  user: {
    _id: string
    username: string
  }
  role: 'member' | 'admin' | 'owner'
  online?: boolean
}