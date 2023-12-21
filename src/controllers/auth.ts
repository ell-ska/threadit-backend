import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import { assertIsDefined } from '../utils/assertions'
import User from '../models/User'

export const register = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      return res.status(400).json({ message: 'missing username or password' })
    }

    const existingUser = await User.findOne({ username })
    if (existingUser) {
      return res.status(400).json({ message: 'username taken' })
    }

    const user = new User({ username, password })
    await user.save()

    res.status(201).json({ username, id: user._id })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'internal server error' })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      return res.status(400).json({ message: 'missing username or password' })
    }
    
    const user = await User.findOne({ username }, '+password')
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(400).json({ message: 'wrong username or password' })
    }

    const secret = process.env.JWT_SECRET
    assertIsDefined(secret)
    const token = jwt.sign({ userId: user._id }, secret, { expiresIn: '1h' })

    const refreshTokenSecret = process.env.REFRESH_JWT_SECRET
    assertIsDefined(refreshTokenSecret)
    const refreshToken = jwt.sign({ userId: user._id }, secret)

    res.status(200).json({ token, refreshToken, username })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'internal server error' })
  }
}

export const refreshJWT = async (req: Request, res: Response) => {
  const { refreshToken } = req.body

  const refreshTokenSecret = process.env.REFRESH_JWT_SECRET
  assertIsDefined(refreshTokenSecret)

  try {
    const payload = jwt.verify(refreshToken, refreshTokenSecret)

    const secret = process.env.JWT_SECRET
    assertIsDefined(secret)
    const token = jwt.sign({ userId: payload?.userId }, secret, { expiresIn: '1h' })

    console.log('token refreshed: ' + token)

    return res.status(200).json({
      token
    })
  } catch (error) {
    return res.status(403).json({
      message: 'invalid refresh token'
    })
  }
}

export const profile = async (req: Request, res: Response) => {
  const { userId } = req
  if (!userId) {
    return res.status(400).json({ message: 'missing user id' })
  }

  const user = await User.findById(userId)
  if (!user) {
    return res.status(404).json({ message: 'user not found' })
  }

  res.status(200).json({
    username: user.username
  })
}
