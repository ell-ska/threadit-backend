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

  jwt.verify(token, secret, (error, payload) => {
    if (error) {
      return res.status(403).json({ message: 'access forbidden' })
    }

    const decodedToken = payload as { userId: string } | undefined

    req.userId = decodedToken?.userId
    next()
  })
}

export default validateToken