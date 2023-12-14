import { Document, Schema, Types, model } from 'mongoose'

import { getOGImage } from '../utils/getOgImage'

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
    url: {
      type: String,
      required: true,
      trim: true
    },
    image: {
      type: String
    }
  },
  body: {
    type: String,
  }
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

const Post = model<IPost>('Post', PostSchema)

export default Post