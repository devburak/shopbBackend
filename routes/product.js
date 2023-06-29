
const express = require('express');
const Product = require('../db/models/product');
const User = require('../db/models/user');
const jwtAuthMiddleware = require('../middleware/jwtAuth');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
      const { page = 1, limit = 10, sort = 'name' } = req.query;
  
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: sort,
        populate: 'categories' // Kategorileri doldur
      };
  
      const products = await Product.paginate({}, options);
  
      res.status(200).json(products);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Bir hata oluştu' });
    }
  });

router.get('/byid/:id', async (req,res)=>{
    try{
        const {id} = req.params
        const product = await Product.findById(id ).populate('categories storedFiles')
        res.status(200).json(product)

    }catch(error){
        console.log(error);
        res.status(500).json({error: 'Bir hata oluştu'})

    }
})

// Create New Product
router.post('/',jwtAuthMiddleware, async (req, res) => {
  try {
    const { name, content, allergenWarnings, salesType, price, stock, categories, discount, storedFiles } = req.body;
    // Gerekli alanların kontrolü
    if (!name || !content || !salesType || !price || !categories) {
        return res.status(400).json({ error: 'Lütfen gerekli alanları doldurun' });
      }
    // Yeni ürünü oluştur
    const newProduct = new Product({
      name,
      content,
      allergenWarnings,
      salesType,
      price,
      stock,
      categories,
      discount,
      storedFiles
    });
    // Ürünü kaydet
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Bir hata oluştu' });
  }
});

module.exports = router;
  