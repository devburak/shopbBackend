const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../db/models/user');
const Profile = require('../db/models/profile');
const { jwtAuthMiddleware, addToRevocationList } = require('../middleware/jwtAuth');
const jwt = require("jsonwebtoken");
const router = express.Router();
const {secretKey , jwtExpire , refreshExpire , refreshSecret} =require('../config/loadConfiguration')
// Yeni kullanıcı oluşturma
router.post('/signup', async (req, res) => {
  try {
    const { username, password, name, email, phone } = req.body;

    // Kullanıcı adı ve e-posta adresi benzersiz olmalıdır
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ error: 'This username or email already use' });
    }

    const user = new User({ username, password, name, email, phone });
    await user.save();

    res.status(201).json({ message: 'New User created' });
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Error: signup' });
  }
});

// Giriş yapma
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    const user = await User.findOne({
      $or: [
        { username: identifier },
        { email: identifier }
      ]
    });
    if (!user) {
      return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre' });
    }
    // Şifre doğrulama
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre' });
    }

    // Access token oluşturma
    const accessToken = jwt.sign({ userId: user._id, role: user.role }, secretKey, { expiresIn: jwtExpire });

    // Refresh token oluşturma
    const refreshToken = jwt.sign({ userId: user._id, role: user.role }, jwtExpire, { expiresIn: refreshExpire });
    // save Refresh token 
    user.refreshToken = refreshToken;
    await user.save();
    res.status(200).json({ accessToken, refreshToken });

  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Bir hata oluştu' });
  }
});

router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    // Refresh token'ı kontrol et ve kullanıcının bilgilerini al
    const decodedToken = jwt.verify(refreshToken, refreshSecret);

    const userId = decodedToken.userId;

    // Kullanıcıyı veritabanından bul
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    // Kullanıcının refresh token'ı veritabanındakiyle eşleşiyor mu kontrol et
    if (refreshToken !== user.refreshToken) {
      return res.status(401).json({ error: 'Geçersiz refresh token' });
    }

    // Yeni bir access token oluştur
    const accessToken = jwt.sign({ userId: user._id, role: user.role }, secretKey, { expiresIn: jwtExpire });

    res.status(200).json({ accessToken });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Bir hata oluştu' });
  }
});

// Profil güncelleme
router.put('/profile', jwtAuthMiddleware, async (req, res) => {
  try {
    const { userId } = req.user; // İstekteki JWT'den kullanıcı kimliğini al

    // Kullanıcıyı kimlik bilgisine göre bul
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User Not Found' });
    }

    // Profil bilgilerini güncelle
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    await user.save();

    res.status(200).json({ message: 'Profile updated' });
  } catch (error) {
    res.status(500).json({ error: 'Error: profile update' });
  }
});

router.post('/logout', jwtAuthMiddleware, async (req, res) => {
  try {
    const tokenId = req.headers.authorization?.split(' ')[1]; // Header'dan token çekme
    console.log(tokenId)
    // Kullanıcının refreshToken'ını sıfırlama
    const userId = req.user.userId; // Varsayılan olarak kullanıcı kimliği req.user içerisinde saklanıyor
    const updatedUser = await User.findByIdAndUpdate(userId, { refreshToken: null }, { new: true });
    // Token'ı revocation listesine ekle
    await addToRevocationList(tokenId);
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'An error occurred while logging out' });
  }
});

router.get('/isAuthenticated', jwtAuthMiddleware, async (req, res) => {
  try {
    // Kullanıcının kimliğini alın
    const userId = req.user.userId;
    console.log(userId)
    // Kullanıcı profili bilgilerini getir
    const userProfile = await Profile.findOne({ userId }).populate('userId', 'username name email phone role');

    if (!userProfile) {
      // Kullanıcı profili bulunamadıysa, sadece User modelinden bilgileri getir
      const user = await User.findById(userId).select('_id as userId username name email phone role');
      if (!user) {
        return res.status(404).json({ error: 'Kullanıcı bilgisi bulunamadı',isAuthenticated: false });
      }
      // Kullanıcı bilgilerini döndür
      res.status(200).json({ user: { ...user._doc, userId: user._id ,isAuthenticated: true} });
    } else {
      // Kullanıcı profili bulunduysa, profil ve User modelinden bilgileri birleştirerek döndür
      const mergedProfile = { ...userProfile._doc, ...userProfile.userId._doc };
      res.status(200).json({ userProfile: mergedProfile ,isAuthenticated: true});
    }

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Bir hata oluştu' , isAuthenticated: false });
  }
});




module.exports = router;
