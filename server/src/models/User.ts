import { hash, verify } from 'argon2'
import { Schema, Types, model } from 'mongoose'

export interface IUserDefinition {
  _id: typeof Types.ObjectId
  username: string
}

export const userDefinition = {
  _id: { type: Types.ObjectId, required: true },
  username: { type: String, required: true },
}

export interface IUser {
  username: string
  password: string
}

const UserSchema = new Schema<IUser>(
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
