const express = require('express');
const Profile = require('../db/models/profile');
const User = require('../db/models/user');
const jwtAuthMiddleware = require('./middleware');
const router = express.Router();

router.post('/', jwtAuthMiddleware, async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
      }
      const profile = new Profile({
        userId: req.user.id,
        addresses: req.body.addresses,
        preferredLanguage: req.body.preferredLanguage,
      });
  
      await profile.save();
  
      res.status(201).json(profile);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Profil oluşturulurken bir hata oluştu.' });
    }
  });

  
  // Profil güncelleme
  router.put('/', jwtAuthMiddleware, async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
      }
  
      const profile = await Profile.findOne({ userId: req.user.id });
      if (!profile) {
        return res.status(404).json({ message: 'Profil bulunamadı.' });
      }
  
      profile.addresses = req.body.addresses;
      profile.preferredLanguage = req.body.preferredLanguage;
  
      await profile.save();
  
      res.json(profile);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Profil güncellenirken bir hata oluştu.' });
    }
  });
  
  
  // Profil silme
  router.delete('/', jwtAuthMiddleware, async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
      }
  
      const profile = await Profile.findOneAndDelete({ userId: req.user.id });
      if (!profile) {
        return res.status(404).json({ message: 'Profil bulunamadı.' });
      }
  
      res.json({ message: 'Profil başarıyla silindi.' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Profil silinirken bir hata oluştu.' });
    }
  });
  
  
  
  module.exports = router;
  