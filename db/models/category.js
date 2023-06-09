const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const categorySchema = new mongoose.Schema({
  title: {type: String, required: true},
  description: { type: String, required: true },
  slug: { type: String, required: true },
  image: { type: mongoose.Schema.Types.ObjectId, ref: 'StoredFile' }
});

// Pagination pluginini ekle
categorySchema.plugin(mongoosePaginate);
const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
