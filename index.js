const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectToDatabase = require('./db');
//routes
const userRoutes = require('./routes/user');
const profileRoutes = require('./routes/profile');
const administrationRoutes = require('./routes/userAdministration')
const fileRoutes = require('./routes/file')
const app = express();
app.use(express.json());
// CORS OK
app.use(cors());
// 
connectToDatabase();

// Temel bir GET 
app.get('/', (req, res) => {
    res.send('Hello word');
  });
// Routes
app.use('/api/user', userRoutes);
app.use('/api/profile',profileRoutes);
app.use('/api/administration',administrationRoutes);
app.use('/api/file' , fileRoutes);

  const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server http://127.0.0.1:${port} portunda çalışıyor.`);
});