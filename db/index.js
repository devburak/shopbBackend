const mongoose = require('mongoose');
const password = process.env.DB_PASSWORD;
const user = process.env.DB_USER;
const dbName = process.env.DB_NAME;

const uri = `mongodb+srv://${user}:${password}@shop.gcs4ua6.mongodb.net/${dbName}`;

let _isConnected = false;

async function connectToDatabase() {
  try {
    console.log('MongoDB bağlantısı kuruluyor.');
    await mongoose.connect(uri, { user:user, pass: password, useNewUrlParser: true, useUnifiedTopology: true , connectTimeoutMS: 10000});
    console.log('MongoDB bağlantısı başarılı.');
    _isConnected = true;
  } catch (error) {
    console.error('MongoDB bağlantısı başarısız:', error);
  }
}

function isConnected() {
  return _isConnected;
}

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB bağlantısı kapatıldı.');
  process.exit(0);
});

module.exports = { connectToDatabase, isConnected };
