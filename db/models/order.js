const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const product = require('./product')

const guestCustomerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: false
  }
});

const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  guestCustomer: guestCustomerSchema,
  products: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      default: 1
    }
  }],
  address: { type: String, required: true },
  status: { type: String, enum: ['waiting payment','preparing', 'departed', 'done'], default: 'waiting payment' },
  orderDate: { type: Date, default: Date.now },
  shipmentDate: { type: Date },
  paymentDate: { type: Date },
  note:{type: String},
  latestProccess: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, required: true, default: 'not defined'  },
  paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  paymentId:{ type: String },
  orderCode: {
    type: String,
    unique: true,
    required: true
  }
});
// Pagination
orderSchema.plugin(mongoosePaginate);
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
