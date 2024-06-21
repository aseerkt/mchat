import { Schema, model } from 'mongoose'
import { IUserDefinition, userDefinition } from './User'

export interface IRoom {
  name: string
  createdBy: IUserDefinition
}

const RoomSchema = new Schema<IRoom>(
  {
    name: { type: String, required: true },
    createdBy: userDefinition,
  },
  { timestamps: true },
)

export const Room = model('Room', RoomSchema)
