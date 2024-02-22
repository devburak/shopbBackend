const { getMinioClient } = require('../storage/minioClient');
const { config } = require('../config/loadConfiguration');
const fs = require('fs');
const path = require('path');
const createThumbnail = require('../storage/createThumbnail');
const StoredFile = require('../db/models/storedFiles');
const util = require('util');
const stat = util.promisify(fs.stat);

const slugify = require('slugify');

function isImageFile(fileName) {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
  const extension = fileName.slice(((fileName.lastIndexOf(".") - 1) >>> 0) + 2);
  return imageExtensions.includes(`.${extension.toLowerCase()}`);
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

    const currentYear = new Date().getFullYear();
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');

    while (attempt < maxRetries) {
      try {

        // const fileName = file.originalname;

        // Dosya adını ve uzantısını ayır
        const fileExtension = path.extname(file.originalname).toLowerCase();
        const fileNameWithoutExtension = path.basename(file.originalname, fileExtension);

        // Dosya adını slugify et ve uzantıyı tekrar ekle
        const sanitizedFileName = slugify(fileNameWithoutExtension, {
          lower: true,
          strict: false, // Özel karakterleri '-' ile değiştir
          remove: /[*+~.()'"!:@]/g
        }) + fileExtension;

        console.log("File ext: " , fileExtension,isImageFile(fileExtension))

        const filePath = file.path;
        const fileStream = fs.createReadStream(filePath);

        const filePathInBucket = `${currentYear}/${currentMonth}/${sanitizedFileName}`;

        console.log(sanitizedFileName);
        // Orijinal dosyayı yükle
        await minioClient.putObject(bucketName, filePathInBucket, fileStream);

        let thumbnailUrl = null;

        if (isImageFile(sanitizedFileName)) {
          const thumbnailFileName = `th_${sanitizedFileName}`;
          const thumbnailsDir = path.join(process.env.TEMP_UPLOADS, 'thumbnails');

          if (!fs.existsSync(thumbnailsDir)) {
            fs.mkdirSync(thumbnailsDir);
          }

          const thumbnailFilePath = path.join(thumbnailsDir, thumbnailFileName);
          const thumbnail = await createThumbnail(filePath, thumbnailFilePath);
          await minioClient.putObject(bucketName, `thumbnails/${currentYear}/${currentMonth}/${thumbnail.name}`, fs.createReadStream(thumbnail.path));
          console.log("PUT thumnail is OK.")
          thumbnailUrl = `https://${config.storageClients.publicEndPoint}/thumbnails/${currentYear}/${currentMonth}/${path.parse(thumbnailFilePath).name}.webp`;

          console.log(thumbnailUrl)
          // fs.unlinkSync(thumbnail.path);
        }

        const fileStats = await stat(filePath);
        const fileUrl = `https://${config.storageClients.publicEndPoint}/${filePathInBucket}`;

        // Dosyayı veritabanına kaydet
        const storedFile = new StoredFile({
          fileName: sanitizedFileName,
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
      path: `${currentYear}/${currentMonth}`,
      thumbnailFileName: savedFile.thumbnailFileName,
      thumbnailUrl: savedFile.thumbnailUrl,
      uploadedAt: savedFile.uploadedAt,
    };
  }

  /**
   * Dosya ve ilgili thumbnail'ları depolama servisinden ve veritabanından siler.
   * @param {string} bucketName - Bucket adı.
   * @param {string} fileId - Silinecek dosyanın veritabanı ID'si.
   */
  async deleteFileAndThumbnails(bucketName, fileId) {
    try {
      const minioClient = await getMinioClient();
      // Dosyayı veritabanından bul
      const file = await StoredFile.findById(fileId);
      if (!file) throw new Error('File not found in the database');


      console.log(bucketName, fileId)

      // Dosyayı ve thumbnail'ları depolama servisinden sil
      await minioClient.removeObject(bucketName, file.fileName);
      console.log(`File ${file.fileName} deleted from storage`);

      // Eğer resim dosyası ise ve thumbnail varsa, bunları da sil
      if (isImageFile(file.fileName) && file.thumbnailUrl) {
        const thumbnailName = `thumbnails/${file.fileName}`; // Thumbnail adını belirleyin, bu örnek bir yapılandırmadır
        await minioClient.removeObject(bucketName, thumbnailName);
        console.log(`Thumbnail ${thumbnailName} deleted from storage`);
      }

      // Dosyayı veritabanından sil
      await StoredFile.deleteOne({ _id: fileId });
      console.log(`File ${file.fileName} deleted from database`);

    } catch (error) {
      console.error('Error in deleteFileAndThumbnails: ', error);
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

  /**
   * Storage'de dosya adını değiştirir ve veritabanı kaydını günceller.
   * @param {string} bucketName - Bucket adı.
   * @param {string} oldFilePath - Eski dosyanın yolu.
   * @param {string} oldFileName - Eski dosya adı.
   * @param {string} newFilePath - Yeni dosyanın yolu.
   * @param {string} newFileName - Yeni dosya adı.
   * @param {string} fileId - Dosyanın veritabanındaki ID'si.
   */
  async renameFile(bucketName, oldFilePath, oldFileName, newFilePath, newFileName, fileId) {
    try {
      const minioClient = await getMinioClient();

      // Tam eski ve yeni yolları oluştur
      const oldFullFilePath = `${oldFilePath}/${oldFileName}`;
      const newFullFilePath = `${newFilePath}/${newFileName}`;

      console.log("eski :", oldFullFilePath)
      console.log("yeni :", newFullFilePath)
      // const fileExtension = path.extname(newFileName).toLowerCase();

      // Eski dosyayı yeni adla kopyala
      await minioClient.copyObject(bucketName, newFullFilePath, `${bucketName}/${oldFullFilePath}`);
      console.log("copy OK.")
      // Eski dosyayı sil
      await minioClient.removeObject(bucketName, oldFullFilePath);
      console.log("remove OK.")
      // Thumbnail işlemleri
      if (isImageFile(oldFileName)) {
        // Eski ve yeni thumbnail yollarını oluştur
        const oldThumbnailName = `th_${path.basename(oldFileName, path.extname(oldFileName))}.webp`;
        const oldThumbnailPath = `thumbnails/${oldFilePath}/${oldThumbnailName}`;
        const newThumbnailName = `th_${path.basename(newFileName, path.extname(newFileName))}.webp`;
        const newThumbnailPath = `thumbnails/${newFilePath}/${newThumbnailName}`;

        console.log("oldThumbnailName: " , oldThumbnailName,"oldThumbnailPath : " , oldThumbnailPath,"newThumbnailName:" ,newThumbnailName ,"newThumbnailPath :",newThumbnailPath )
        // Eski thumbnail'i yeni adla kopyala
        await minioClient.copyObject(bucketName, `${newThumbnailPath}`, `${bucketName}/${oldThumbnailPath}`);
        console.log("thumbnails copy OK.")
        // Eski thumbnail'i sil
        await minioClient.removeObject(bucketName, oldThumbnailPath);
        console.log("thumbnails remove OK.")
        // Yeni thumbnail URL'si
        const newThumbnailUrl = `https://${config.storageClients.publicEndPoint}/${newThumbnailPath}`;

        // Veritabanındaki kaydı güncelle
        const updateFields = {
          fileName: newFileName,
          path: newFilePath,
          fileUrl: `https://${config.storageClients.publicEndPoint}/${newFullFilePath}`,
          thumbnailUrl: newThumbnailUrl
        };

        await StoredFile.findByIdAndUpdate(fileId, updateFields);
      } else {
        // Dosya resim değilse sadece dosya adını güncelle
        await StoredFile.findByIdAndUpdate(fileId, {
          fileName: newFileName,
          path: newFilePath,
          fileUrl: `https://${config.storageClients.publicEndPoint}/${newFullFilePath}`
        });
      }
      console.log(`Dosya ${oldFullFilePath} olarak ${newFullFilePath} adıyla güncellendi.`);
    } catch (error) {
      console.error('Dosya adı değiştirme hatası:', error);
      throw error;
    }
  }


  // Yardımcı fonksiyonlar
  // ...

}

module.exports = new FileService();
