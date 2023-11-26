const express = require('express');
const router = express.Router();
const multer = require('multer');
// const { uploadFile , deleteFile} = require('../storage/minioService');
// const {listFiles} =require('../services/file')
const {uploadFile,deleteFile,listFiles}  =require('../services/storage')
const {jwtAuthMiddleware} = require('../middleware/jwtAuth');
const fs = require('fs');
const StoredFile = require('../db/models/storedFiles');
const r2 = require('../storage/r2service')
const { config } = require('../config/loadConfiguration'); // Dynamic Config import
const {getMinioClient}  =require('../storage/minioClient');

// Multer ayarları
const storage = multer.diskStorage({
  destination: process.env.TEMP_UPLOADS,
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Dosya yükleme endpoint'i
router.post('/upload', jwtAuthMiddleware, upload.single('file'), async (req, res) => {
  // Kullanıcının rolünü kontrol et
  if (req.user.role !== 'admin' && req.user.role !== 'staff') {
    return res.status(403).json({ error: 'Yetkisiz erişim' });
  }
  try {
    // Dosyayı yükle
    const bucketName = config.storageClients[config.type]?.bucketName || "test";
    console.log("bucket",bucketName)
    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const uploadResponse = await uploadFile(bucketName, req.file ,req.user.userId);
    return res.json({ message: 'Dosya başarıyla yüklendi.'  ,...uploadResponse });
  } catch (error) {
    console.error('Dosya yükleme hatası:', error);
    // Dosya yükleme hatası durumunda da dosyayı sil
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({ error: 'Dosya yükleme hatası' });
  }
});
// Dosya silme endpoint'i
router.delete('/delete/:fileId', jwtAuthMiddleware, async (req, res) => {
    const fileId = req.params.fileId;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const bucketName = config.storageClients[config.type].bucketName;
  
    try {
      // Dosya veritabanında bulunur mu kontrol et
      const file = await StoredFile.findById(fileId);
      if (!file) {
        return res.status(404).json({ error: 'Dosya bulunamadı' });
      }
  
      // Yetkilendirme kontrolü
      if (userRole === 'admin' || (userRole === 'staff' && file.uploadedBy.toString() === userId)) {
        // Dosyayı sil
       const deletedFile =  await deleteFile(bucketName, fileId, file.fileName);
        return res.json({ message: 'Dosya başarıyla silindi' ,deletedFile});
      } else {
        return res.status(403).json({ error: 'Yetkisiz erişim' });
      }
    } catch (error) {
      console.error('Dosya silme hatası:', error);
      return res.status(500).json({ error: 'Dosya silme hatası' });
    }
});

// Dosya listeleme endpoint'i
router.get('/list', jwtAuthMiddleware, async (req, res) => {
    // Kullanıcının rolünü kontrol et
    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
      return res.status(403).json({ error: 'Yetkisiz erişim' });
    }
    try {
      const pageNumber = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 20;
      const searchKey = req.query.s || '';
      const result = await listFiles(pageNumber, pageSize, searchKey);
      return res.json(result);
    } catch (error) {
      console.error('Dosya listeleme hatası:', error);
      return res.status(500).json({ error: 'Dosya listeleme hatası' });
    }
  });

router.get('/list-storage', jwtAuthMiddleware, async (req, res) => {
  try {
    const files = await r2.listFiles();
    console.log(files)
    res.status(200).json(files);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: error.message });
  }
});

// Test dosya yükleme endpoint'i
router.post('/test-upload', upload.single('file'), async (req, res) => {
  try {
    const minioClient = await getMinioClient();
    const file = req.file;
    const bucketName = 'test'; // Minio bucket adınızı buraya yazın
    console.log('Yüklenen dosyanın yolu:', req.file.path);
    // Dosyayı Minio'ya yükle
    const fileStream = fs.createReadStream(file.path);
    await minioClient.putObject(bucketName, file.originalname, fileStream);

    // Yükleme başarılı
    res.status(200).send({ message: 'Dosya başarıyla yüklendi.' });
  } catch (error) {
    console.error('Dosya yükleme hatası:', error);
    res.status(500).send({ error: 'Dosya yüklenirken bir hata oluştu.' });
  } finally {
    // Yüklenen dosyayı sil
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }
  }
});

module.exports = router;
