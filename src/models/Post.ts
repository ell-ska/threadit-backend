import { Document, Model, Schema, Types, model } from 'mongoose'

import { getOGImage } from '../utils/getOGImage'

interface IComment extends Document {
  body: string
  author: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const CommentSchema = new Schema<IComment>({
  body: {
    type: String,
    required: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
})

interface IPost extends Document {
  author: Types.ObjectId
  title: string
  link?: {
    url: string,
    image?: string
  }
  body?: string
  createdAt: Date
  updatedAt: Date
  comments: IComment[]
}

interface IPostProps {
  comments: Types.DocumentArray<IComment>
}

type TPostModel = Model<IPost, {}, IPostProps>

const PostSchema = new Schema<IPost, TPostModel>({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  link: {
    url: {
      type: String,
      trim: true
    },
    image: {
      type: String
    },
  },
  body: {
    type: String,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  comments: [CommentSchema]
}, {
  timestamps: true,
})

PostSchema.pre('save', async function(next) {
  if (!this.isModified('link')) next()

  if (this.link) {
    const images = await getOGImage(this.link.url)
    if (images) this.link.image = images[0].url
  }
})

const Post = model<IPost, TPostModel>('Post', PostSchema)

export default Post