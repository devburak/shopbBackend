const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const contentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    categories: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Category', 
        required: true 
    }],
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'draft',
        index: true
    },
    publishedDate: {
        type: Date,
        index: true
    },
    tags: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag',
        index: true
    }],
    images: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StoredFile'
    }],
    summary: {
        type: String
    },
    attributes: {
        type: Map,
        of: String
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    updatedAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    period: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Period'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    root: {
        type: String,
        required: true,
        get: data => JSON.parse(data),
        set: data => JSON.stringify(data)
    }
});

// Getter'ların çalışması için aşağıdaki seçeneği schema'ya ekleyin
contentSchema.set('toJSON', { getters: true, virtuals: true });
contentSchema.set('toObject', { getters: true, virtuals: true });


const contentVersionSchema = new mongoose.Schema({
    contentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Content' },
    content: { type: mongoose.Schema.Types.Mixed, required: true },
    editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    editedAt: { type: Date, default: Date.now },
});

contentVersionSchema.plugin(mongoosePaginate);
// Pagination pluginini ekle
contentSchema.plugin(mongoosePaginate);
const ContentVersion = mongoose.model('ContentVersion', contentVersionSchema);
const Content = mongoose.model('Content', contentSchema);

module.exports = { Content, ContentVersion };
