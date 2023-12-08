import express from 'express'
import mongoose from 'mongoose'

import 'dotenv/config'
import * as authController from './controllers/auth'

const app = express()
app.use(express.json())

app.post('/register', authController.register)
app.post('/login', authController.login)

const mongoUrl = process.env.DB_URL
if (!mongoUrl) throw Error('missing db url')

mongoose.connect(mongoUrl)
  .then(() => {
    const port = parseInt(process.env.PORT || '3000')
    app.listen(port, () => {
      console.log(`server listening on port ${port}`)
    })
  })