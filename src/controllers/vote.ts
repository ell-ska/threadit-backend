import { Request, Response } from 'express'

import { assertIsDefined } from '../utils/assertions'
import Post from '../models/Post'

export const upvote = async (req: Request, res: Response) => {
  assertIsDefined(req.userId)
  const { postId } = req.params

  const post = await Post.findById(postId)

  if (!post) {
    return res.status(404).json({
      message: `post not found for id: ${postId}`
    })
  }

  post.upvote(req.userId)

  try {
    const upvotedPost = await post.save()
    return res.status(200).json(upvotedPost)
  } catch (error) {
    return res.status(500).json({
      message: 'failed to upvote post'
    })
  }
}

export const downvote = async (req: Request, res: Response) => {
  assertIsDefined(req.userId)
  const { postId } = req.params

  const post = await Post.findById(postId)

  if (!post) {
    return res.status(404).json({
      message: `post not found for id: ${postId}`
    })
  }

  post.downvote(req.userId)

  try {
    const downvotedPost = await post.save()
    return res.status(200).json(downvotedPost)
  } catch (error) {
    return res.status(500).json({
      message: 'failed to downvote post'
    })
  }
}