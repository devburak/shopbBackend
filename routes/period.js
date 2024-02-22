const express = require('express');
const router = express.Router();
const periodService = require('../services/periodService');
const { jwtAuthMiddleware, isAdmin } = require('../middleware/jwtAuth'); // authMiddleware dosyanızın yolu

// Tüm dönemleri listele (Public)
router.get('/', async (req, res) => {
  try {
    const periods = await periodService.getAllPeriods();
    res.json(periods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Yeni bir dönem oluştur (JWT ve Rol Kontrolü)
router.post('/', jwtAuthMiddleware, async (req, res) => {
  try {
    const period = await periodService.createPeriod(req.body);
    res.status(201).json(period);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Bir dönemi güncelle (JWT ve Rol Kontrolü)
router.put('/:id', jwtAuthMiddleware, async (req, res) => {
  try {
    const period = await periodService.updatePeriod(req.params.id, req.body);
    res.json(period);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Bir dönemi sil (JWT ve Admin Rol Kontrolü)
router.delete('/:id', jwtAuthMiddleware, isAdmin, async (req, res) => {
  try {
    await periodService.deletePeriod(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
