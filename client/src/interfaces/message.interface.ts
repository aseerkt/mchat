export interface IMessage {
  _id: string
  roomId: string
  sender: {
    _id: string
    username: string
  }
  text: string
  createdAt: string
  updatedAt: string
}
