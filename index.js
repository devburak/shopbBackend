const express = require('express');
const cors = require('cors');
require('dotenv').config();
const {connectToDatabase,isConnected} = require('./db');
const { loadConfiguration } = require('./config/loadConfiguration'); // loadConfiguration fonksiyonunu dahil edin

//routes
const userRoutes = require('./routes/user');
const profileRoutes = require('./routes/profile');
const administrationRoutes = require('./routes/userAdministration');
const fileRoutes = require('./routes/file');
const productRoutes = require('./routes/product');
const categoryRoutes = require('./routes/category');
const orderRoutes = require('./routes/order');
const passwordRoutes = require('./routes/password');
const systemRoutes = require('./routes/system');
const tagRoutes = require('./routes/tag');
const menuRoutes = require('./routes/menu');
const contentRoutes = require('./routes/content');
const periodRoutes = require('./routes/period');

function checkRequestSize(limitInBytes) {
 
  return function(req, res, next) {
      let data = '';
      req.on('data', chunk => {
          data += chunk;
          console.log("Size: ",Buffer.byteLength(data, 'utf8'))
          // İstek boyutunu kontrol et
          if (Buffer.byteLength(data, 'utf8') > limitInBytes) {
              // İstek boyutu limiti aşıldı
              res.status(413).send('Request Entity Too Large');
              req.connection.destroy(); // İstek bağlantısını kapat
          }
      });

      req.on('end', () => {
          // İstek boyutu limitin altında, devam et
          next();
      });
  };
}







const app = express();


app.use(express.json({ limit: '90mb' })); // JSON istekleri için limit
app.use(express.urlencoded({ limit: '90mb', extended: true })); // URL-encoded istekleri için limit
// app.use(express.json());
// CORS OK
app.use(cors());
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
// // Middleware'i uygulamanıza ekleyin
// app.use(checkRequestSize(50 * 1024 * 1024)); // Örneğin, 50 MB limit

const startApp = async () => {
  try {
    await connectToDatabase(); // Veritabanına bağlan
    // Veritabanı bağlantısının başlamasını takiben 10 saniye bekleyin
    await new Promise(resolve => setTimeout(resolve, 20000));

    while (!isConnected()) {
      console.log('Veritabanına bağlanmayı bekliyor...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    await loadConfiguration(); // Konfigürasyonu yükle


    // Temel bir GET 
    app.get('/', (req, res) => {
      res.send('Hello word');
    });
    // Routes
    app.use('/api/user', userRoutes);
    app.use('/api/profile', profileRoutes);
    app.use('/api/administration', administrationRoutes);
    app.use('/api/file', fileRoutes);
    app.use('/api/product', productRoutes);
    app.use('/api/category', categoryRoutes);
    app.use('/api/order', orderRoutes);
    app.use('/api/password', passwordRoutes);
    app.use('/api/system', systemRoutes);
    app.use('/api/tags', tagRoutes);
    app.use('/api/menu', menuRoutes);
    app.use('/api/content' , contentRoutes);
    app.use('/api/period' , periodRoutes);

    const port = process.env.PORT || 5000;

    app.listen(port, () => {
      console.log(`Server http://127.0.0.1:${port} portunda çalışıyor.`);
    });
  } catch (error) {
    console.error('Uygulama başlatılamadı:', error.message);
    process.exit(1); // Hata durumunda uygulamayı sonlandır
  }
};

startApp(); // Uygulamayı başlat