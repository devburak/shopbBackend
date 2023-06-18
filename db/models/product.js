const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const storedFile = require('./storedFiles')
const discountSchema = new mongoose.Schema({
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    coupon: { type: String },
    discountAmount: { type: String, required: true },
    discountedPrice: { type: Number, required: true },
  });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  content: { type: String, required: true },
  allergenWarnings: { type: String },
  salesType: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }],
  discount: discountSchema,
  storedFiles: [storedFile.schema] // storedFiles , for images
});
productSchema.plugin(mongoosePaginate);
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
