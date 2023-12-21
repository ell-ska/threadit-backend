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
  upvotes: Types.Array<Types.ObjectId>
  downvotes: Types.Array<Types.ObjectId>
  score: number
}

interface IPostProps {
  comments: Types.DocumentArray<IComment>
  upvote: (userId: string) => void
  downvote: (userId: string) => void
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
  comments: [CommentSchema],
  upvotes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  downvotes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  score: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
})

PostSchema.method('upvote', function(this: IPost, userId: string) {
  const userIdObject = new Types.ObjectId(userId)

  if (this.upvotes.includes(userIdObject)) {
    return
  }

  if (this.downvotes.includes(userIdObject)) {
    this.downvotes.pull(userIdObject)
  }

  this.upvotes.push(userIdObject)
})

PostSchema.method('downvote', function(this: IPost, userId: string) {
  const userIdObject = new Types.ObjectId(userId)

  if (this.downvotes.includes(userIdObject)) {
    return
  }

  if (this.upvotes.includes(userIdObject)) {
    this.upvotes.pull(userIdObject)
  }

  this.downvotes.push(userIdObject)
})

PostSchema.pre('save', async function(next) {
  if (this.isModified('link')) {
    if (this.link) {
      const images = await getOGImage(this.link.url)
      if (images) this.link.image = images[0].url
    }
  }

  if (this.isModified('upvotes') || this.isModified('downvotes')) {
    this.score = this.upvotes.length - this.downvotes.length
  }

  next()
})

const Post = model<IPost, TPostModel>('Post', PostSchema)

export default Post