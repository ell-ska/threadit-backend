import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import multer from 'multer'

import 'dotenv/config'
import * as authController from './controllers/auth'
import * as postController from './controllers/post'
import * as commentController from './controllers/comment'
import * as voteController from './controllers/vote'
import * as imageController from './controllers/image'
import validateToken from './middleware/validateToken'

const app = express()
app.use(cors())
app.use(express.json())

const upload = multer()

app.post('/sign-up', authController.register)
app.post('/sign-in', authController.login)
app.post('/token/refresh', authController.refreshJWT)
app.get('/profile', validateToken, authController.profile)

app.post('/posts', validateToken, upload.single('image'), postController.createPost)
app.put('/posts/:id', validateToken, postController.editPost)
app.delete('/posts/:id', validateToken, postController.deletePost)
app.get('/posts', postController.getAllPosts)
app.get('/posts/:id', postController.getPost)

app.post('/posts/:postId/comments', validateToken, commentController.createComment)
app.delete('/posts/:postId/comments/:commentId', validateToken, commentController.deleteComment)

app.post('/posts/:postId/upvote', validateToken, voteController.upvote)
app.post('/posts/:postId/downvote', validateToken, voteController.downvote)

app.get('/images/:id', imageController.getImage)

const mongoUrl = process.env.DB_URL
if (!mongoUrl) throw Error('missing db url')

mongoose.connect(mongoUrl)
  .then(() => {
    const port = parseInt(process.env.PORT || '3000')
    app.listen(port, () => {
      console.log(`server listening on port ${port}`)
    })
  })