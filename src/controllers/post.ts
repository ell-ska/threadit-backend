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

export const getAllPosts = async (_: Request, res: Response) => {
  const limit = 5
  const page = 1

  const posts = await Post
    .find()
    // .limit(limit)
    // .skip(limit * (page === 1 ? page : page - 1))
    .populate('author', 'username')

  const totalCount = await Post.countDocuments()

  return res.status(200).json({
    posts,
    totalPages: Math.ceil(totalCount / limit)
  })
}

export const getPost = async (req: Request, res: Response) => {
  const { id } = req.params

  const post = await Post.findById(id).populate('author', 'username')
  if (!post) {
    return res.status(404).json({
      message: `post not found for id: ${id}`
    })
  }

  return res.status(200).json(post)
}