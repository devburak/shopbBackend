const mongoose = require('mongoose');

const systemVariableSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // Örneğin: "languageList" ya da "colors"
  valueType: { type: String, required: true, enum: ['array','object' ,'objectArray', 'string', 'number', 'boolean'] }, // Değişkenin tipi
  value: { type: mongoose.Schema.Types.Mixed, required: true }, // Esnek yapıda bir değer
  description: { type: String }, // Değişkenin açıklaması (isteğe bağlı)
  isPublic:{type:Boolean , required: true , default:false}
});

const SystemVariable = mongoose.model('SystemVariable', systemVariableSchema);

module.exports = SystemVariable;
