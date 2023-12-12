import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

const validateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization']
  
  const token = authHeader?.split(' ')[1]
  if (!token) {
    return res.status(401).json({ message: 'unauthorized' })
  }

  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw Error('missing JWT_SECRET')
  }

  jwt.verify(token, secret, (error, decodedToken) => {
    if (error || !decodedToken || typeof decodedToken === 'string') {
      return res.status(403).json({ message: 'access forbidden' })
    }

    req.userId = decodedToken.userId
    next()
  })
}

export default validateToken