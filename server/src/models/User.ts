import { hash, verify } from 'argon2'
import { Model, Schema, Types, model } from 'mongoose'

export interface IUserDefinition {
  _id: typeof Types.ObjectId
  username: string
}

export const userDefinition = {
  type: {
    _id: { type: Types.ObjectId, required: true },
    username: { type: String, required: true },
  },
  required: true,
} as const

export interface IUser {
  username: string
  password: string
}

export interface IUserMethods {
  verifyPassword(password: string): Promise<boolean>
}

const UserSchema: Schema<IUser, Model<IUser>, IUserMethods> = new Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
  },
  {
    timestamps: true,
    methods: {
      verifyPassword(password: string) {
        return verify(this.password, password)
      },
    },
  },
)

UserSchema.pre('save', async function (next) {
  this.password = await hash(this.password)
  next()
})

export const User = model('User', UserSchema)
