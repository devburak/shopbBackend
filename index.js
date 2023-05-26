const express = require('express');
require('dotenv').config();
const connectToDatabase = require('./db');

const app = express();
// Bağlantıyı yapmak 
connectToDatabase();

// Temel bir GET 
app.get('/', (req, res) => {
    res.send('Hello');
  });


  const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server ${port} portunda çalışıyor.`);
});