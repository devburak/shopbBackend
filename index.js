const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectToDatabase = require('./db');
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


const app = express();
app.use(express.json());
// CORS OK
app.use(cors());
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
const startApp = async () => {
  try {
    await connectToDatabase(); // Veritabanına bağlan
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
    app.use('/api/tags' , tagRoutes);
    app.use('/api/menu', menuRoutes);

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