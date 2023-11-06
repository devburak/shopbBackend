const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const contentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    publishedDate: { type: Date },
    images: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StoredFile' }],
    summary: { type: String },
    attributes: { type: Map, of: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});
// Pagination pluginini ekle
contentSchema.plugin(mongoosePaginate);

const contentVersionSchema = new mongoose.Schema({
    contentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Content' },
    content: { type: mongoose.Schema.Types.Mixed, required: true },
    editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    editedAt: { type: Date, default: Date.now },
});

contentVersionSchema.plugin(mongoosePaginate);

const ContentVersion = mongoose.model('ContentVersion', contentVersionSchema);
const Content = mongoose.model('Content', contentSchema);

module.exports = { Content, ContentVersion };
