const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const tagSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  usageCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

tagSchema.plugin(mongoosePaginate);
const Tag = mongoose.model('Tag', tagSchema);
module.exports = Tag;
