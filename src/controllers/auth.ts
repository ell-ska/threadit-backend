import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

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
    
    const user = await User.findOne({ username })
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(400).json({ message: 'wrong username or password' })
    }

    const secret = process.env.JWT_SECRET
    if (!secret) {
      throw Error('missing JWT_SECRET')
    }
    
    const token = jwt.sign({ userId: user._id }, secret)

    res.status(200).json({ token, username })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'internal server error' })
  }
}
