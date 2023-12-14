import { Document, Schema, Types, model } from 'mongoose'

interface IPost extends Document {
  author: Types.ObjectId
  title: string
  link?: string
  body?: string
  createdAt: Date
  updatedAt: Date
}

const PostSchema = new Schema<IPost>({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  link: {
    type: String,
    trim: true,
  },
  body: {
    type: String,
  }
}, {
  timestamps: true,
})

const Post = model<IPost>('Post', PostSchema)

export default Post