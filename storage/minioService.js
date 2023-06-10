const { minioClient } = require('./minioClient');
const fs = require('fs');
const path = require('path');
const createThumbnail = require('./createThumbnail');
const StoredFile = require('../db/models/storedFiles');
const util = require('util');
const stat = util.promisify(fs.stat);

async function uploadFile(bucketName, file,uploadedBy ) {
  try {
    // Orijinal dosyayı yükle
    const fileName = file.originalname;
    const filePath = file.path;
    const fileStream = fs.createReadStream(filePath);
    await minioClient.putObject(bucketName, fileName, fileStream);

    // Dosya uzantısını kontrol et
    const fileExtension = path.extname(fileName).toLowerCase();
    const thumbnailFileName = `th_${fileName}`;
    const thumbnailsDir = path.join(process.env.TEMP_UPLOADS, 'thumbnails');
    const fileStats = await stat(filePath);

    // `thumbnails` dizini yoksa oluştur
    if (!fs.existsSync(thumbnailsDir)) {
      fs.mkdirSync(thumbnailsDir);
    }

    const thumbnailFilePath = path.join(thumbnailsDir, thumbnailFileName);

      // Eğer dosya bir resim ise thumbnail oluştur ve yükle
      if (isImageFile(fileExtension)) {
          const thumbnail = await createThumbnail(filePath, thumbnailFilePath);
          await minioClient.putObject(bucketName, `thumbnails/${thumbnail.name}`, fs.createReadStream(thumbnail.path));
          // delete temp files
       fs.unlinkSync(thumbnail.path);
      }
     
      // const fileUrl = await getFileUrl(bucketName, fileName);
      const fileUrl = `https://${process.env.MINIO_ENDPOINT}/${process.env.MINIO_BUCKET}/${fileName}`
      // const thumbnailUrl = isImageFile(fileExtension) ? await getFileUrl(bucketName, `thumbnails/${path.parse(thumbnailFilePath).name}.webp`) : null;
      const thumbnailUrl = isImageFile(fileExtension) ? `https://${process.env.MINIO_ENDPOINT}/${process.env.MINIO_BUCKET}/thumbnails/${path.parse(thumbnailFilePath).name}.webp` : null;

      console.log({
        fileName,
        size: fileStats.size,
        mimeType: file.mimetype,
        fileUrl,
        thumbnailUrl,
        uploadedBy,
    })
      // Dosyayı veritabanına kaydet
      const storedFile = new StoredFile({
          fileName,
          size: fileStats.size,
          mimeType: file.mimetype,
          fileUrl,
          thumbnailUrl,
          uploadedBy,
      });

      const savedFile = await storedFile.save();

      
       fs.unlinkSync(filePath);
    return {
      fileName,
      fileUrl,
      thumbnailFileName,
      thumbnailUrl, 
      uploadedAt: savedFile.uploadedAt,
    };
  } catch (error) {
    console.error('Dosya yükleme hatası:', error);
    throw error;
  }
}

// Verilen dosya uzantısının bir resim dosyası olup olmadığını kontrol eder
function isImageFile(fileExtension) {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  return imageExtensions.includes(fileExtension);
}

// MinIO'dan dosya URL'sini alır
async function getFileUrl(bucketName, fileName) {
  const objectUrl = await minioClient.presignedGetObject(bucketName, fileName);
  return objectUrl?.split('?')[0];
}

module.exports = {uploadFile};
