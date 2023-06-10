const Minio = require('minio');

// Create a new Minio client
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: 1*process.env.MINIO_PORT,
  useSSL: true,
  accessKey: process.env.MINIO_ACCESSKEY,
  secretKey: process.env.MINIO_SECRETKEY,
});


  module.exports = {minioClient};