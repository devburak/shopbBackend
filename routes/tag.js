const express = require('express');
const router = express.Router();
const tagServices = require('../services/tagServices'); // tagServices'in yolu gerektiği gibi ayarlanmalıdır.
const { jwtAuthMiddleware, isAdmin, isAdminOrStaff } = require('../middleware/jwtAuth');
const { createSearchRegex } = require('../utils/regex');
// Tag oluşturma
router.post('/', jwtAuthMiddleware, isAdminOrStaff, async (req, res) => {
    try {
        const tagName = req.body.name;
        const newTag = await tagServices.createTag(tagName);
        res.status(201).json(newTag);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Tag güncelleme (name)
router.put('/:id/name', jwtAuthMiddleware, isAdminOrStaff, async (req, res) => {
    try {
        const tagId = req.params.id;
        const newName = req.body.name;
        const updatedTag = await tagServices.updateTagName(tagId, newName);
        res.status(200).json(updatedTag);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// // Tag kullanım sayısını güncelleme (usageCount)
// router.put('/tags/:id/usage', async (req, res) => {
//   try {
//     const tagId = req.params.id;
//     const increment = req.body.increment; // Bu değer 1 veya -1 olmalıdır.
//     const updatedTag = await tagServices.updateTagUsageCount(tagId, increment);
//     res.status(200).json(updatedTag);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// Tag silme
router.delete('/:id', jwtAuthMiddleware, async (req, res) => {
    try {
        const tagId = req.params.id;
        const deletedTag = await tagServices.deleteTag(tagId);
        if (!deletedTag) {
            return res.status(404).json({ message: 'Tag not found' });
        }
        res.status(200).json({ message: 'Tag deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Tag alma (name ile filtreleme ve sayfalama)
router.get('/', async (req, res) => {
    try {
        const { name, page, limit } = req.query;
        let filter = {};
        if (name) {
            const regex = createSearchRegex(name);
            filter = { name: { $regex: regex } };
        }

        // const filter = name ? { name: { $regex: name, $options: 'i' } } : {};
        const options = {
            page: parseInt(page, 10) || 1,
            limit: parseInt(limit, 10) || 10,
        };
        const tags = await tagServices.getTags(filter, options);
        res.status(200).json(tags);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
