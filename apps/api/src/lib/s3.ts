import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const region = process.env.S3_REGION ?? 'us-east-1'
const bucket = process.env.S3_BUCKET ?? ''
const endpoint = process.env.S3_ENDPOINT || undefined
const publicUrl = (process.env.S3_PUBLIC_URL ?? '').replace(/\/$/, '')

export const s3Enabled = Boolean(bucket && process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY)

const s3 = new S3Client({
  region,
  endpoint,
  forcePathStyle: Boolean(endpoint),
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? '',
  },
})

export const createPresignedUpload = async (key: string, contentType: string) => {
  const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType })
  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 })
  const base = publicUrl || (endpoint ? `${endpoint.replace(/\/$/, '')}/${bucket}` : `https://${bucket}.s3.${region}.amazonaws.com`)
  return { uploadUrl, publicUrl: `${base}/${key}` }
}
