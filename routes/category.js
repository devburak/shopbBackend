// routes/category.js
const express = require('express');
const router = express.Router();
const {jwtAuthMiddleware,isAdmin,isAdminOrStaff} = require('../middleware/jwtAuth');
const Product = require('../db/models/product')
const Category = require('../db/models/category');

// Tüm
router.get('/', async (req, res) => {
    try {
      const { page = 1, limit = 25, search } = req.query;
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        populate: { path: 'imageId', select: 'fileName size mimeType fileUrl thumbnailUrl' }
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
  
  router.get('/all', async (req, res) => {
    try {
      const { search } = req.query;
  
      let query = {};
  
      if (search) {
        query = { title: { $regex: search, $options: 'i' } };
      }
      const categories = await Category.find(query)
  
      res.status(200).json(categories);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Bir hata oluştu' });
    }
  });
  

router.get('/withnop', jwtAuthMiddleware ,isAdminOrStaff, async (req, res) => {
    //Kullanıcının rolünü kontrol et
    // if (req.user.role !== 'admin' && req.user.role !== 'staff') {
    //     return res.status(403).json({ error: 'Yetkisiz erişim' });
    //   }
    try {

        const { page = 1, limit = 25, sort } = req.query;
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: {} // Boş bir nesne olarak başlatıyoruz
        };
        if (sort) {
            const sortFields = sort.split(',');
            for (const sortField of sortFields) {
              const [field, order] = sortField.split(':');
              const sortOrder = order === 'asc' ? 1 : -1; // asc için 1, desc için -1
              options.sort[field] = sortOrder;
            }
          }
        const result = await Category.paginate({}, options);
        
        const categories = result.docs;
        const categoryData = [];

        for (const category of categories) {
            const numOfProducts = await Product.countDocuments({ categories: category._id });
            const categoryInfo = {
                _id: category._id,
                title: category.title,
                description: category.description,
                slug: category.slug,
                imageId: category.imageId,
                numOfProducts: numOfProducts
            };
            categoryData.push(categoryInfo);
        }
        const { docs, ...otherProps } = result;
        res.status(200).json({
            ...otherProps,
            categories: categoryData
          });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Bir hata oluştu' });
    }
});

router.get('/byid/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const category = await Category.findById(id).populate('image');
      res.status(200).json(category);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Bir hata oluştu' });
    }
  });

// Yeni kategori oluşturma
router.post('/', jwtAuthMiddleware,isAdmin, async (req, res) => {
    try {
      const { title, description, slug, image } = req.body;
  
      // Gerekli alanların kontrolü
      if (!title || !description || !slug) {
        return res.status(400).json({ error: 'Lütfen gerekli alanları doldurun' });
      }
  
      // Yeni kategoriyi oluştur
      const newCategory = new Category({
        title,
        description,
        slug,
        image
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
router.put('/:id', jwtAuthMiddleware,isAdmin, async (req, res) => {
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
