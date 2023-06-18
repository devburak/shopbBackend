// routes/category.js

const express = require('express');
const router = express.Router();
const jwtAuthMiddleware = require('../middleware/jwtAuth');

const Category = require('../db/models/category');

// Tüm kategorileri getir
router.get('/', async (req, res) => {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const options = {
        page: parseInt(page),
        limit: parseInt(limit)
      };
  
      let query = {};
  
      if (search) {
        query = { title: { $regex: search, $options: 'i' } };
      }
  
      const categories = await Category.paginate(query, options);
  
      res.status(200).json(categories);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Bir hata oluştu' });
    }
  });
  
// Yeni kategori oluşturma
router.post('/', jwtAuthMiddleware.isAdmin, async (req, res) => {
  try {
    const { title, description, slug, imageUrl } = req.body;

    // Gerekli alanların kontrolü
    if (!title || !description || !slug) {
      return res.status(400).json({ error: 'Lütfen gerekli alanları doldurun' });
    }
    // Yeni kategoriyi oluştur
    const newCategory = new Category({
      title,
      description,
      slug,
      imageUrl
    });
    // Kategoriyi kaydet
    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Bir hata oluştu' });
  }
});

// Kategori güncelleme
router.put('/:id', jwtAuthMiddleware.isAdmin, async (req, res) => {
  try {
    const { title, description, slug, imageUrl } = req.body;

    // Gerekli alanların kontrolü
    if (!title || !description || !slug) {
      return res.status(400).json({ error: 'Lütfen gerekli alanları doldurun' });
    }
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { title, description, slug, imageUrl },
      { new: true }
    );
    if (!category) {
      return res.status(404).json({ error: 'Kategori bulunamadı' });
    }
    res.status(200).json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Bir hata oluştu' });
  }
});



module.exports = router;
