// services/contentService.js

const { Content } = require('../db/models/content');
const Tag = require('../db/models/tag');
const Category = require('../db/models/category');
const contentServices = {
    getContents: async (filters, options) => {
        try {
            // Filtreleme için sorgu oluşturma
            let query = {};
            if (filters.searchTerm) {
                query.$or = [
                    { title: { $regex: filters.searchTerm, $options: 'i' } },
                    { summary: { $regex: filters.searchTerm, $options: 'i' } }
                ];
            }
            if (filters.author) {
                query.author = filters.author; // Örnek olarak, author alanını kontrol ediyoruz
            }
            if (filters.tags) {
                query.tags = { $in: filters.tags }; // Tag'lar bir dizi olduğundan $in operatörünü kullanıyoruz
            }
            if (filters.startDate && filters.endDate) {
                query.publishedDate = {
                    $gte: new Date(filters.startDate),
                    $lte: new Date(filters.endDate)
                };
            }
            // Period filtresi
            if (filters.period) {
                query.period = filters.period;
            }

            // Kategori filtresi (Eğer kategori adı veya ID'si filtresi varsa)
            if (filters.categoryName) {
                const category = await Category.findOne({ slug: filters.categoryName });
                if (category) query.categories = category._id;
            } else if (filters.categoryId) {
                query.categories = filters.categoryId;
            }

            options.populate = [
                { path: 'categories', select: 'name slug' },
                { path: 'createdBy', select: 'name' },
                { path: 'period', select: 'name startDate endDate' },
                { path: 'tags', select: 'name' },
                { path: 'images', select: 'fileName size fileUrl mimeType path thumbnailUrl' }
            ];

            // Sonuçları publishedDate'e göre azalan sırada sırala
            options.sort = { publishedDate: -1 };

            const contents = await Content.paginate(query, options);
            return contents;
        } catch (error) {
            throw error;
        }
    },
    getContentByTagId: async (tagId, options) => {
        try {
            const contents = await Content.paginate(
                { tags: tagId },
                options
            );
            return contents;
        } catch (error) {
            throw error;
        }
    },
    getContentByTagName: async (tagName, options) => {
        try {
            const tag = await Tag.findOne({ name: tagName });
            if (!tag) return null;

            const contents = await Content.paginate(
                { tags: tag._id },
                options
            );
            return contents;
        } catch (error) {
            throw error;
        }
    },
    // Slug kontrolü
    checkSlugExists: async (slug) => {
        const content = await Content.findOne({ slug: slug });
        return !!content; // Eğer içerik varsa true, yoksa false döndürür
    },
    // createContent: async (contentData, userId)  => {
    //     try {
    //         const slugExists = await contentServices.checkSlugExists(contentData.slug);
    //         if (slugExists) {
    //             throw new Error('This slug is already in use. Please choose another one.');
    //         }
    //         // Tag'ları kontrol et ve yoksa oluştur
    //         if (contentData.tags && contentData.tags.length > 0) {
    //             const tagIds = await Promise.all(contentData.tags.map(async (tagName) => {
    //                 let tag = await Tag.findOne({ name: tagName });
    //                 if (!tag) {
    //                     tag = new Tag({ name: tagName });
    //                     await tag.save();
    //                 }
    //                 return tag._id;
    //             }));
    //             contentData.tags = tagIds;
    //         }
    //         contentData.createdBy = userId; // İçeriği oluşturan kullanıcı
    //         const content = new Content(contentData);
    //         await content.save();
    //         return content;
    //     } catch (error) {
    //         throw error;
    //     }
    // },
    createContent: async (contentData, userId) => {
        try {
            const slugExists = await contentServices.checkSlugExists(contentData.slug);
            if (slugExists) {
                throw new Error('This slug is already in use. Please choose another one.');
            }
            if (contentData.tags && contentData.tags.length > 0) {
                const tagIds = await Promise.all(contentData.tags.map(async (tagName) => {
                    let tag = await Tag.findOne({ name: tagName });
                    if (!tag) {
                        tag = new Tag({ name: tagName });
                        await tag.save();
                    }
                    return tag._id;
                }));
                contentData.tags = tagIds;
            }
            contentData.createdBy = userId;
            const content = new Content(contentData);
            await content.save();
            return content;
        } catch (error) {
            throw error;
        }
    },
    updateContent: async (id, contentData, userId) => {
        try {
            contentData.updatedBy = userId;
            const updatedContent = await Content.findByIdAndUpdate(id, contentData, { new: true });
            return updatedContent;
        } catch (error) {
            throw error;
        }
    },
     getContentsByCategoryName :async (categorySlug, options) => {
        try {
            const category = await Category.findOne({ slug: categorySlug });
            if (!category) {
                throw new Error(`Category not found with slug: ${categorySlug}`);
            }
    
            // 'options' nesnesine 'populate' seçeneğini ekleyin
            const populateOptions = [
                { path: 'categories', select: 'name slug' },
                { path: 'createdBy', select: 'name' },
                { path: 'period', select: 'name startDate endDate' },
                { path: 'tags', select: 'name' },
                { path: 'images', select: 'fileName size fileUrl mimeType path thumbnailUrl' }
            ];
    
            // Eğer 'options' nesnesi zaten bir 'populate' özelliği içeriyorsa, bunu koruyun ve yeni seçenekler ekleyin
            if (options.populate) {
                options.populate = options.populate.concat(populateOptions);
            } else {
                options.populate = populateOptions;
            }
    
            // '$in' operatörünü kullanarak, kategori ID'sini içeren tüm içerikleri döndür
            const contents = await Content.paginate({ categories: { $in: [category._id] } }, options);
            return contents;
        } catch (error) {
            throw error;
        }
    },
    getContentsByCategoryId: async (categoryId, options) => {
        try {
            const category = await Category.findById(categoryId);
            if (!category) {
                throw new Error(`Category not found with ID: ${categoryId}`);
            }
            const contents = await Content.paginate({ categories: categoryId }, options);
            return contents;
        } catch (error) {
            throw error;
        }
    },
     getContentBySlug: async (slug) => {
        try {
            const content = await Content.findOne({ slug: slug })
                .populate('categories', 'name slug') // Kategori adlarını çek
                .populate('createdBy', 'name') // Oluşturan kullanıcının kullanıcı adı ve adını çek
                .populate('period', 'name startDate endDate') // Dönem bilgilerini çek
                .populate('tags', 'name') // Etiket adlarını çek
                .populate('images', 'fileName size fileUrl mimeType path thumbnailUrl'); 
            if (!content) {
                throw new Error(`Content not found with slug: ${slug}`);
            }
            return content;
        } catch (error) {
            throw error;
        }
    },
    getContentById: async (id) => {
        try {
            const content = await Content.findById(id)
                .populate('categories', 'name slug') // Kategori adlarını çek
                .populate('createdBy', 'name') // Oluşturan kullanıcının kullanıcı adı ve adını çek
                .populate('period', 'name startDate endDate') // Dönem bilgilerini çek
                .populate('tags', 'name') // Etiket adlarını çek
                .populate('images', 'fileName size fileUrl mimeType path thumbnailUrl'); 
            if (!content) {
                throw new Error(`Content not found with ID: ${id}`);
            }
            return content;
        } catch (error) {
            throw error;
        }
    },
    searchContents: async (searchParams, options) => {
        try {
            let query = {};

            const regex = new RegExp(searchParams.searchTerm, 'i'); // Büyük/küçük harf duyarsız regex
            query.$or = [
                { title: { $regex: regex } },
                { summary: { $regex: regex } },
                // 'root' alanında regex kullanarak arama yapma
                { root: { $regex: regex } }
            ];

            // Kategorilere göre filtreleme
            if (searchParams.categories && searchParams.categories.length > 0) {
                query.categories = { $in: searchParams.categories };
            }

            // Etiketlere göre filtreleme
            if (searchParams.tags && searchParams.tags.length > 0) {
                query.tags = { $in: searchParams.tags };
            }

            // Yayımlanma tarihi aralığına göre filtreleme
            if (searchParams.startDate && searchParams.endDate) {
                query.publishedDate = { 
                    $gte: new Date(searchParams.startDate), 
                    $lte: new Date(searchParams.endDate) 
                };
            }

            // Sayfalama ve populate seçeneklerini ayarla
            options.populate = [
                { path: 'categories', select: 'name slug' },
                { path: 'tags', select: 'name' },
                { path: 'createdBy', select: 'name' },
                { path: 'period', select: 'name startDate endDate' },
                { path: 'images', select: 'fileName size fileUrl mimeType path thumbnailUrl' }
            ];

            // Sonuçları publishedDate'e göre azalan sırada sırala
            options.sort = { publishedDate: -1 };

            const result = await Content.paginate(query, options);
            return result;
        } catch (error) {
            throw error;
        }
    },
};

module.exports = contentServices;
