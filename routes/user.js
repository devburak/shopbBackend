const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../db/models/user');
const Profile = require('../db/models/profile');
const jwtAuthMiddleware = require('../middleware/jwtAuth');
const  jwt =require ("jsonwebtoken");
const router = express.Router();

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
    const accessToken = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Refresh token oluşturma
    const refreshToken = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });
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
    const decodedToken = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

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
    const accessToken = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ accessToken });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Bir hata oluştu' });
  }
});

// Profil güncelleme
router.put('/profile' ,jwtAuthMiddleware, async (req, res) => {
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





module.exports = router;
