const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema({
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    coupon: { type: String },
    discountAmount: { type: String, required: true },
    discountedPrice: { type: Number, required: true },
  });

const productSchema = new mongoose.Schema({
  name: {
    tr: { type: String, required: true },
    en: { type: String, required: true },
    gr: { type: String, required: true },
  },
  content: {
    tr: { type: String, required: true },
    en: { type: String, required: true },
    gr: { type: String, required: true },
  },
  allergenWarnings: {
    tr: { type: String },
    en: { type: String },
    gr: { type: String },
  },
  salesType: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }],
  discount: discountSchema,
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
