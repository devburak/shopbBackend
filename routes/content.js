const express = require('express');
const router = express.Router();
const contentServices = require('../services/content');
const {jwtAuthMiddleware} = require('../middleware/jwtAuth');

// Yeni içerik oluşturma
router.post('/', jwtAuthMiddleware, async (req, res) => {
    try {
        const content = await contentServices.createContent(req.body, req.user.userId);
        res.status(201).json(content);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Kategori adına göre içerikleri listeleme
router.get('/byCategoryName/:name', async (req, res) => {
    try {
        // Eğer limit belirtilmemişse varsayılan olarak 20 kullan
        const limit = parseInt(req.query.limit) || 20;
        const page = parseInt(req.query.page) || 1; // Eğer page belirtilmemişse varsayılan olarak 1 kullan

        const contents = await contentServices.getContentsByCategoryName(req.params.name, { page, limit });
        res.json(contents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Kategori ID'sine göre içerikleri listeleme
router.get('/byCategoryId/:id', async (req, res) => {
    try {
        const contents = await contentServices.getContentsByCategoryId(req.params.id, { page: req.query.page, limit: req.query.limit });
        res.json(contents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// İçerikleri listeleme ve filtreleme
router.get('/contents', async (req, res) => {
    try {
        const { page = 1, limit = 20, searchTerm, author, tags, startDate, endDate,categoryName, categoryId} = req.query;
        const options = {
            page: parseInt(page)|| 1,
            limit:parseInt(limit)|| 20,
            sort: { publishedDate: -1 }, // Varsayılan olarak oluşturulma tarihine göre azalan sırada sıralama
        };
        const filters = { searchTerm, author, tags, startDate, endDate,categoryName, categoryId };
        const result = await contentServices.getContents(filters, options);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.get('/search', async (req, res) => {
    try {
        // Sorgu parametrelerinden arama filtrelerini ve sayfalama seçeneklerini al
        const { searchTerm, categories, tags, startDate, endDate, page, limit } = req.query;

        // Arama filtrelerini ve sayfalama seçeneklerini birer nesne olarak oluştur
        const searchParams = {
            searchTerm,
            categories: categories ? categories.split(',') : [], // Virgülle ayrılmış string'i diziye çevir
            tags: tags ? tags.split(',') : [],
            startDate,
            endDate
        };

        const options = {
            page: parseInt(page, 10) || 1,
            limit: parseInt(limit, 10) || 20,
        };

        // Arama servisi fonksiyonunu çağır
        const results = await contentServices.searchContents(searchParams, options);

        // Arama sonuçlarını döndür
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Slug kontrolü için GET endpoint'i
router.get('/checkSlug',jwtAuthMiddleware, async (req, res) => {
    const { slug } = req.query; // Slug, sorgu parametresi olarak alınır

    if (!slug) {
        return res.status(400).json({ message: 'Slug parameter is required.' });
    }

    try {
        const slugExists = await contentServices.checkSlugExists(slug);
        if (slugExists) {
            // Eğer slug mevcutsa, kullanılamaz olduğunu belirten bir yanıt döndür
            res.status(200).json({ message: 'Slug is already in use.', available: false });
        } else {
            // Eğer slug mevcut değilse, kullanılabilir olduğunu belirten bir yanıt döndür
            res.status(200).json({ message: 'Slug is available.', available: true });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Slug'a göre içerik getirme
router.get('/slug/:slug', async (req, res) => {
    try {
        const content = await contentServices.getContentBySlug(req.params.slug);
        if (!content) {
            return res.status(404).json({ message: 'Content not found' });
        }
        res.json(content);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ID'ye göre içerik getirme
router.get('/byid/:id', async (req, res) => {
    try {
        const content = await contentServices.getContentById(req.params.id);
        if (!content) {
            return res.status(404).json({ message: 'Content not found' });
        }
        res.json(content);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



module.exports = router;