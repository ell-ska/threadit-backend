import { Request, Response } from 'express'

import { assertIsDefined } from '../utils/assertions'
import Post from '../models/Post'

export const createPost = async (req: Request, res: Response) => {
  assertIsDefined(req.userId)
  const { title, link, body } = req.body

  const post = new Post({
    title,
    link,
    body,
    author: req.userId
  })

  try {
    const savedPost = await post.save()
    return res.status(201).json(savedPost)
  } catch (error) {
    return res.status(500).json({
      message: 'failed to create post'
    })
  }
}

export const getAllPosts = async (req: Request, res: Response) => {
  const posts = await Post.find().populate('author', 'username')

  return res.status(200).json(posts)
}