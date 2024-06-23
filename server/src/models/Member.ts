import { Model, Schema, Types, model } from 'mongoose'
import { IUserDefinition, userDefinition } from './User'

// INFO: order is important here
export const memberRoles = ['member', 'admin', 'owner'] as const

export type MemberRole = (typeof memberRoles)[number]

export interface IMember {
  roomId: typeof Types.ObjectId
  user: IUserDefinition
  role: MemberRole
}

const MemberSchema: Schema<IMember, Model<IMember>> = new Schema({
  roomId: { type: Types.ObjectId, required: true, index: true },
  user: userDefinition,
  role: {
    type: String,
    enum: memberRoles,
    required: true,
  },
})

MemberSchema.index({ roomId: 1, 'user._id': 1 }, { unique: true })

export const Member = model('Member', MemberSchema)
