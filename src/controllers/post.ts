import { Request, Response } from 'express'
import mongoose from 'mongoose'

import { assertIsDefined } from '../utils/assertions'
import Post from '../models/Post'

export const createPost = async (req: Request, res: Response) => {
  assertIsDefined(req.userId)
  const { title, link, body } = req.body

  const post = new Post({
    title,
    link: link ? { url: link } : null,
    body,
    author: req.userId
  })

  try {
    if (req.file) {
      const dbConnection = mongoose.connection
      const bucket = new mongoose.mongo.GridFSBucket(dbConnection.db, {
        bucketName: 'images'
      })

      const uploadStream = bucket.openUploadStream(req.file.originalname)
      const fileId = uploadStream.id

      await new Promise((resolve, reject) => {
        uploadStream.once('finish', resolve)
        uploadStream.once('error', reject)
        uploadStream.end(req.file?.buffer)
      })

      post.image = {
        mimeType: req.file.mimetype,
        size: req.file.size,
        _id: fileId
      }
    }

    const savedPost = await post.save()
    return res.status(201).json(savedPost)
  } catch (error) {
    return res.status(500).json({
      message: 'failed to create post'
    })
  }
}

export const getAllPosts = async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit?.toString() || '5')
  const page = parseInt(req.query.page?.toString() || '1')

  if (isNaN(page) || isNaN(limit)) {
    res.status(400).json({
      message: 'malformed query'
    })
  }

  const posts = await Post.aggregate([
    {
      $addFields: {
        sortValue: {
          $divide: [
            {
              $add: [
                { $ifNull: ['$score', 0] },
                1
              ]
            },
            {
              $pow: [
                {
                  $add: [
                    1,
                    {
                      $divide: [
                        { $subtract: [new Date(), '$createdAt'] },
                        1000 * 60 * 60
                      ]
                    }
                  ]
                },
                1.5
              ]
            }
          ]
        }
      }
    },
    { $sort: { sortValue: -1 } },
    { $skip: limit * (page - 1) },
    { $limit: limit },
    {
      $addFields: {
        commentCount: {
          $size: { $ifNull: ['$comments', []] }
        }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              username: 1
            }
          }
        ],
        as: 'author'
      },
    },
    { $unwind: '$author' },
    {
      $project: {
        _id: 1,
        author: 1,
        title: 1,
        link: 1,
        body: 1,
        score: 1,
        upvotes: 1,
        downvotes: 1,
        commentCount: 1,
        createdAt: 1,
        updatedAt: 1,
      }
    },
  ])

  const totalCount = await Post.countDocuments()

  return res.status(200).json({
    posts,
    totalPages: Math.ceil(totalCount / limit)
  })
}

export const getPost = async (req: Request, res: Response) => {
  const { id } = req.params

  const post = await Post
    .findById(id)
    .populate('author', 'username')
    .populate('comments.author', 'username')

  if (!post) {
    return res.status(404).json({
      message: `post not found for id: ${id}`
    })
  }

  return res.status(200).json(post)
}