const mongoose = require('mongoose');
const password = process.env.DB_PASSWORD;
const user = process.env.DB_USER;

const uri = `mongodb+srv://${user}:${password}@shop.gcs4ua6.mongodb.net`;

async function connectToDatabase() {
  try {
    console.log(uri)
    await mongoose.connect(uri, { user:user, pass: password, useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB bağlantısı başarılı.');
  } catch (error) {
    console.error('MongoDB bağlantısı başarısız:', error);
  }
}

module.exports = connectToDatabase;
