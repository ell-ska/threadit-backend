import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'

import 'dotenv/config'
import * as authController from './controllers/auth'
import validateToken from './middleware/validateToken'

const app = express()
app.use(cors())
app.use(express.json())

app.post('/sign-up', authController.register)
app.post('/sign-in', authController.login)
app.get('/profile', validateToken, authController.profile)

const mongoUrl = process.env.DB_URL
if (!mongoUrl) throw Error('missing db url')

mongoose.connect(mongoUrl)
  .then(() => {
    const port = parseInt(process.env.PORT || '3000')
    app.listen(port, () => {
      console.log(`server listening on port ${port}`)
    })
  })