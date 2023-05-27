const jwt = require('jsonwebtoken');

const secretKey = process.env.JWT_SECRET; // JWT için gizli anahtar

module.exports = {
  generateToken: (payload) => {
    return jwt.sign(payload, secretKey, { expiresIn: '1h' }); // Token oluşturma
  },
  verifyToken: (token) => {
    try {
      return jwt.verify(token, secretKey); // Token doğrulama
    } catch (error) {
      throw new Error('Geçersiz token');
    }
  },
};
