const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../db/models/user');
const jwtAuthMiddleware = require('./middleware');
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
    const { username, password } = req.body;

    // Kullanıcıyı kullanıcı adına göre bul
    const user = await User.findOne({ username:username });
    if (!user) {
      return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre' });
    }
    // Şifre doğrulama
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre' });
    }
    // JWT oluşturma
    const token = jwt.sign({ userId: user._id ,role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (error) {
    console.log(error)
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
