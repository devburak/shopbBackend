const express = require('express');
const Profile = require('../db/models/profile');
const User = require('../db/models/user');
const { jwtAuthMiddleware } = require('../middleware/jwtAuth');
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

router.get('/', jwtAuthMiddleware, async (req, res) => {
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
        return res.status(404).json({ error: 'Kullanıcı bilgisi bulunamadı' });
      }
      // Kullanıcı bilgilerini döndür
      res.status(200).json({ user: { ...user._doc, userId: user._id } });
    } else {
      // Kullanıcı profili bulunduysa, profil ve User modelinden bilgileri birleştirerek döndür
      const mergedProfile = { ...userProfile._doc, ...userProfile.userId._doc };
      res.status(200).json({ userProfile: mergedProfile });
    }

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Bir hata oluştu' });
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
