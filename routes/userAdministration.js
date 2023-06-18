// administration.js

const express = require('express');
const router = express.Router();
const User = require('../db/models/user');
const Profile = require('../db/models/profile');
const jwtAuthMiddleware = require('../middleware/jwtAuth');
const isAdmin = require('../middleware/jwtAuth.js')
// Tüm kullanıcıların rolünü güncelleme (Sadece admin yetkisi gerektirir)
router.put('/users/:userId/role', jwtAuthMiddleware,isAdmin, async (req, res) => {
  try {
    // Yetkilendirme kontrolü: Sadece "admin" rolüne sahip kullanıcılar erişebilir
    // if (req.user.role !== 'admin') {
    //   return res.status(403).json({ message: 'Yetkisiz erişim' });
    // }

    // Güncellenecek kullanıcının id'sini al
    const userId = req.params.userId;

    // Güncellenecek rol değerini al
    const { role } = req.body;

    // Kullanıcıyı veritabanından bul ve rolünü güncelle
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    user.role = role;

    // Kullanıcıyı kaydet
    await user.save();

   return  res.json({ message: 'Kullanıcının rolü güncellendi' });
  } catch (error) {
    console.error(error);
   return res.status(500).json({ message: 'Sunucu hatası' });
  }
});


// Admin ve staff kullanıcı oluşturma
router.post('/user', jwtAuthMiddleware, async (req, res) => {
    try {
      const { username, password, name, email, phone, role } = req.body;
  
      // Sadece admin yetkisindeki kullanıcıların oluşturabilmesi kontrolü
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Yetkisiz erişim' });
      }
  

        // E-posta veya kullanıcı adı alanının benzersiz olup olmadığını kontrol et
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(409).json({ error: 'E-posta veya kullanıcı adı zaten kullanılıyor.' });
        }
        
      // Şifrenin hashlenmesi
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Yeni kullanıcı oluşturma
      const user = new User({
        username,
        password: hashedPassword,
        name,
        email,
        phone,
        role
      });
  
      // Kullanıcıyı kaydetme
      await user.save();
  
      return res.status(201).json({ message: 'Kullanıcı oluşturuldu' });
    } catch (err) {
      return res.status(500).json({ error: 'Kullanıcı oluşturulurken bir hata oluştu' });
    }
  });
  
// Kullanıcının profil ve kullanıcı bilgilerini silme
router.delete('/users/:userId', jwtAuthMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    // Kullanıcının rolünü kontrol et
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Sadece admin kullanıcılar bu işlemi gerçekleştirebilir' });
    }

    // Kullanıcının profil bilgilerini sil
    await Profile.findOneAndDelete({ userId });

    // Kullanıcının kullanıcı bilgilerini sil
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    res.json({ message: 'Kullanıcı profil ve bilgileri başarıyla silindi' });
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});



module.exports = router;

