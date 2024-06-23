import { Model, Schema, Types, model } from 'mongoose'
import { IUserDefinition, userDefinition } from './User'

export interface IMessage {
  roomId: typeof Types.ObjectId
  sender: IUserDefinition
  text: string
}

const MessageSchema = new Schema<IMessage, Model<IMessage>>(
  {
    roomId: { type: Types.ObjectId, required: true, index: true },
    sender: userDefinition,
    text: { type: String, required: true },
  },
  { timestamps: true },
)

export const Message = model('Message', MessageSchema)
