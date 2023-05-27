const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  title: {
    tr: { type: String, required: true },
    en: { type: String, required: true },
    gr: { type: String, required: true },
  },
  description: {
    tr: { type: String, required: true },
    en: { type: String, required: true },
    gr: { type: String, required: true },
  },
  slug: { type: String, required: true },
  imageUrl: { type: String },
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
