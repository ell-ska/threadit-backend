import { Request, Response } from 'express'
import mongoose from 'mongoose'

export const getImage = async (req: Request, res: Response) => {
  const imageId = new mongoose.Types.ObjectId(req.params.id)

  const dbConnection = mongoose.connection
  const bucket = new mongoose.mongo.GridFSBucket(dbConnection.db, {
    bucketName: 'images'
  })

  const downloadStream = bucket.openDownloadStream(imageId)

  downloadStream.on('data', (chunk) => {
    res.write(chunk)
  })

  downloadStream.on('error', (error) => {
    return res.status(500).json({
      message: 'internal server error'
    })
  })

  downloadStream.on('end', () => {
    res.end()
  })
}