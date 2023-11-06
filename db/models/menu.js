const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  order: { type: Number, required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', default: null },
  icon: { type: String }, // İkon için bir class adı veya URL olabilir
  target: { type: String, enum: ['_self', '_blank', '_parent', '_top'], default: '_self' }, // Bağlantının nasıl açılacağı
  type: { type: String, enum: ['link', 'dropdown', 'megaMenu'], default: 'link' }, // Menü öğesinin tipi
  options: {
    type: [{ type: String }],
    default: ['web', 'mobile'] // Varsayılan olarak hem 'web' hem de 'mobile' içerir
  },
  // Diğer özelleştirilebilir alanlar eklenebilir
});

const menuSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  items: [menuItemSchema],
  location: { type: String, required: true }, // Menünün konumu, örneğin 'header', 'footer' vb.
  // Diğer özelleştirilebilir alanlar eklenebilir
});

const Menu = mongoose.model('Menu', menuSchema);
const MenuItem =  mongoose.model('MenuItem', menuItemSchema);


module.exports = { Menu, MenuItem };