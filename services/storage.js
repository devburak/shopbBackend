const { getMinioClient } = require('../storage/minioClient');
const { config } = require('../config/loadConfiguration');
const fs = require('fs');
const path = require('path');
const createThumbnail = require('../storage/createThumbnail');
const StoredFile = require('../db/models/storedFiles');
const util = require('util');
const stat = util.promisify(fs.stat);

const slugify = require('slugify');

function isImageFile(fileExtension) {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    return imageExtensions.includes(fileExtension);
  }


class FileService {


 
  async getFileUrl(bucketName, fileName) {
    const minioClient = await getMinioClient();
    const objectUrl = await minioClient.presignedGetObject(bucketName, fileName);
    return objectUrl?.split('?')[0];
  }

  async deleteFileFromDatabase(fileId) {
    await StoredFile.deleteOne({ _id: fileId });
  }

  async deleteFileFromStorage(bucketName, fileName) {
    const minioClient = await getMinioClient();
    await minioClient.removeObject(bucketName, fileName);
    await minioClient.removeObject(bucketName, `/thumbnails/th_${path.parse(fileName).name}.webp`);
  }

  // Dosya yükleme servisi
  async uploadFile(bucketName, file, uploadedBy) {
    const maxRetries = 3;
    let attempt = 0;
    let savedFile;
    const minioClient = await getMinioClient();

    while (attempt < maxRetries) {
      try {

          // const fileName = file.originalname;
          const fileName = slugify(file.originalname, {
              lower: true,
              remove: /[*+~.()'"!:@]/g
          });
          // Dosya adını ve uzantısını ayır
          const fileExtension = path.extname(file.originalname).toLowerCase();
          const fileNameWithoutExtension = path.basename(file.originalname, fileExtension);

          // Dosya adını slugify et ve uzantıyı tekrar ekle
          const sanitizedFileName = slugify(fileNameWithoutExtension, {
              lower: true,
              strict: true, // Sadece güvenli karakterleri koru
              remove: /[*+~.()'"!:@]/g
          }) + fileExtension;

          const filePath = file.path;
          const fileStream = fs.createReadStream(filePath);

          const currentYear = new Date().getFullYear();
          const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0'); // Ayı iki haneli formatta al

        const filePathInBucket = `${currentYear}/${currentMonth}/${sanitizedFileName}`;
    
        console.log(sanitizedFileName);
        // Orijinal dosyayı yükle
        await minioClient.putObject(bucketName, filePathInBucket, fileStream);
    
        let thumbnailUrl = null;

        if (isImageFile(fileExtension)) {
          const thumbnailFileName = `th_${sanitizedFileName}`;
          const thumbnailsDir = path.join(process.env.TEMP_UPLOADS, 'thumbnails');

          if (!fs.existsSync(thumbnailsDir)) {
            fs.mkdirSync(thumbnailsDir);
          }

          const thumbnailFilePath = path.join(thumbnailsDir, thumbnailFileName);
          const thumbnail = await createThumbnail(filePath, thumbnailFilePath);
          await minioClient.putObject(bucketName, `thumbnails/${currentYear}/${currentMonth}/${thumbnail.name}`, fs.createReadStream(thumbnail.path));
          thumbnailUrl = `https://${config.storageClients.publicEndPoint}/thumbnails/${currentYear}/${currentMonth}/${path.parse(thumbnailFilePath).name}.webp`;
          fs.unlinkSync(thumbnail.path);
        }

        const fileStats = await stat(filePath);
        const fileUrl = `https://${config.storageClients.publicEndPoint}/${filePathInBucket}`;

        // Dosyayı veritabanına kaydet
        const storedFile = new StoredFile({
          fileName,
          path: `${currentYear}/${currentMonth}`,
          size: fileStats.size,
          mimeType: file.mimetype,
          fileUrl,
          thumbnailUrl,
          uploadedBy,
        });

        savedFile = await storedFile.save();

        // Orijinal yüklenen dosyayı sil
        fs.unlinkSync(filePath);

        // İşlem başarılı, döngüyü kır
        break;

      } catch (error) {
        console.error(`Dosya yükleme hatası, yeniden deneme ${attempt + 1}:`, error);
        attempt++;

        // Son deneme hatası durumunda, hata fırlat
        if (attempt === maxRetries) {
          throw new Error('Maksimum yeniden deneme sayısına ulaşıldı, dosya yüklenemedi.');
        }
      }
    }

    if (!savedFile) {
      throw new Error('Dosya veritabanına kaydedilemedi.');
    }

    return {
      fileName: savedFile.fileName,
      fileUrl: savedFile.fileUrl,
      thumbnailFileName: savedFile.thumbnailFileName,
      thumbnailUrl: savedFile.thumbnailUrl, 
      uploadedAt: savedFile.uploadedAt,
    };
  }

  async deleteFile(bucketName, fileId, fileName) {
    try {
      // Veritabanından dosyayı sil
      await this.deleteFileFromDatabase(fileId);
  
      // MinIO'dan dosyayı ve ilgili thumbnail'i sil
      await this.deleteFileFromStorage(bucketName, fileName);
  
      return fileName; // Silinen dosyanın adını döndür
    } catch (error) {
      console.error('Dosya silme hatası:', error);
      throw error;
    }
  }
  async listFiles(bucketName, prefix) {
    try {
        const minioClient = await getMinioClient();
      return new Promise((resolve, reject) => {
        const stream = minioClient.listObjects(bucketName, prefix, true);
        const results = [];
  
        stream.on('data', obj => results.push(obj));
        stream.on('error', err => reject(err));
        stream.on('end', () => resolve(results));
      });
    } catch (error) {
      console.error('Dosya listeleme hatası:', error);
      throw error;
    }
  }
  

  // Yardımcı fonksiyonlar
  // ...

}

module.exports = new FileService();
