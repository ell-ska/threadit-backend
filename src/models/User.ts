import { Document, MongooseError, Schema, model } from 'mongoose'
import bcrypt from 'bcrypt'

interface IUser extends Document {
  username: string
  password: string
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    select: false,
    required: true
  }
}, {
  timestamps: true
})

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) next()

  try {
    const hashedPassword = await bcrypt.hash(this.password, 10)
    this.password = hashedPassword
    next()
  } catch (error) {
    if (error instanceof MongooseError) next(error)
    else throw error
  }
})

const User = model<IUser>('User', UserSchema)

export default User