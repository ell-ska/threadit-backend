import { Request, Response } from 'express'

import { assertIsDefined } from '../utils/assertions'
import Post from '../models/Post'

export const createComment = async (req: Request, res: Response) => {
  const { userId } = req
  assertIsDefined(userId)

  const { postId } = req.params
  const { comment } = req.body

  const post = await Post.findById(postId)
  if (!post) {
    return res.status(404).json({
      message: `no post found with id: ${postId}`
    })
  } 

  post.comments.push({
    body: comment,
    author: userId
  })

  try {
    const savedPost = await post.save()
    return res.status(201).json(savedPost)
  } catch (error) {
    return res.status(500).json({
      message: 'failed to create comment'
    })
  }
}

export const deleteComment = async (req: Request, res: Response) => {
  const { userId } = req
  assertIsDefined(userId)

  const { postId, commentId } = req.params

  const post = await Post.findById(postId)
  if (!post) {
    return res.status(404).json({
      message: `no post found with id: ${postId}`
    })
  }

  const comment = post.comments.id(commentId)
  if (!comment) {
    return res.status(404).json({
      message: `no comment found with id: ${commentId}`
    })
  }

  if (comment.author.toString() !== userId) {
    return res.status(403).json({
      message: 'not authorized'
    })
  }

  try {
    comment.deleteOne()
    const updatedPost = await post.save()

    return res.status(200).json(updatedPost)
  } catch (error) {
    return res.status(500).json({
      message: 'failed to delete comment'
    })
  }
}