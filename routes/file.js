const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadFile } = require('../storage/minioService');
const jwtAuthMiddleware = require('./middleware');
const fs = require('fs');

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
    const bucketName = process.env.MINIO_BUCKET;
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

module.exports = router;
