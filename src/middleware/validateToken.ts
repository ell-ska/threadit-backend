import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

import { assertIsDefined } from '../utils/assertions'
import User from '../models/User'

const validateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization']
  
  const token = authHeader?.split(' ')[1]
  if (!token) {
    return res.status(401).json({ message: 'unauthorized' })
  }

  const secret = process.env.JWT_SECRET
  assertIsDefined(secret)

  jwt.verify(token, secret, async (error, decodedToken) => {
    if (
      error
      || !decodedToken
      || typeof decodedToken === 'string'
      || !await User.exists({ _id: decodedToken.userId })
    ) {
      return res.status(403).json({ message: 'access forbidden' })
    }

    req.userId = decodedToken.userId
    next()
  })
}

export default validateToken