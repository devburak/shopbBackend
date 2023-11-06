const express = require('express');
const router = express.Router();
const menuService = require('../services/menuServices'); 
const {jwtAuthMiddleware,isAdmin,isAdminOrStaff} = require('../middleware/jwtAuth');
const mongoose = require('mongoose');
// Menü Oluşturma Route'u
router.post('/', jwtAuthMiddleware ,isAdmin, async (req, res) => {
  try {
    const menu = await menuService.createMenu(req.body);
    res.status(201).json(menu);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Menüyü ID'ye Göre Getirme Route'u
router.get('/:id', async (req, res) => {
  try {
    const menu = await menuService.getMenuById(req.params.id);
    res.json(menu);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Menüyü Adına Göre Getirme Route'u
router.get('/name/:name', async (req, res) => {
  try {
    const menu = await menuService.getMenuByName(req.params.name);
    res.json(menu);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Tüm Menüleri Getirme Route'u
router.get('/', jwtAuthMiddleware ,isAdminOrStaff,  async (req, res) => {
  try {
    const menus = await menuService.getAllMenus();
    res.json(menus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Menü Güncelleme Route'u
router.put('/:id',  jwtAuthMiddleware ,isAdmin, async (req, res) => {
  try {
    const menu = await menuService.updateMenu(req.params.id, req.body);
    res.json(menu);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Menü Silme Route'u
router.delete('/:id',  jwtAuthMiddleware ,isAdmin, async (req, res) => {
  try {
    await menuService.deleteMenu(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Menü Hiyerarşisini Getirme Route'u
router.get('/hierarchy/:identifier', async (req, res) => {
  try {
    const identifier = req.params.identifier;
    let hierarchy;
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      hierarchy = await menuService.getMenuHierarchy(identifier);
    } else {
      const menu = await menuService.getMenuByName(identifier);
      if (!menu) {
        return res.status(404).json({ message: 'Menu not found' });
      }
      hierarchy = await menuService.getMenuHierarchy(menu._id);
    }
    res.json(hierarchy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
