const path = require('path');
const fs = require('fs');
const multer = require('multer');
const sanitize = require('sanitize-filename');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const mime = require('mime-types');

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'text/plain',
  'application/zip',
]);

const uploadDir = path.resolve(__dirname, '../../..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storageLocal = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadDir);
  },
  filename: function (_req, file, cb) {
    const safeName = `${Date.now()}-${sanitize(file.originalname)}`;
    cb(null, safeName);
  },
});

function fileFilter(_req, file, cb) {
  const mimetype = file.mimetype || mime.lookup(file.originalname);
  if (!ALLOWED_MIME.has(mimetype)) {
    return cb(new Error('Unsupported file type'));
  }
  cb(null, true);
}

const uploadLocal = multer({ storage: storageLocal, limits: { fileSize: MAX_FILE_SIZE }, fileFilter });

function getS3Client() {
  const { S3_ENDPOINT, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY } = process.env;
  if (!S3_REGION || !S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY) return null;
  return new S3Client({
    region: S3_REGION,
    endpoint: S3_ENDPOINT || undefined,
    credentials: { accessKeyId: S3_ACCESS_KEY_ID, secretAccessKey: S3_SECRET_ACCESS_KEY },
    forcePathStyle: !!S3_ENDPOINT,
  });
}

async function uploadBufferToS3(buffer, key, contentType) {
  const client = getS3Client();
  if (!client) throw new Error('S3 not configured');
  const bucket = process.env.S3_BUCKET;
  if (!bucket) throw new Error('S3_BUCKET not set');
  await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: buffer, ContentType: contentType }));
  const endpoint = process.env.S3_PUBLIC_BASE_URL || `https://${bucket}.s3.${process.env.S3_REGION}.amazonaws.com`;
  return `${endpoint}/${key}`;
}

module.exports = { uploadLocal, uploadDir, uploadBufferToS3 };
