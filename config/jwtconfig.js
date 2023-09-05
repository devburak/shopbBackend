const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET; // JWT için gizli anahtar

module.exports = {
  generateToken: (payload) => {
    return jwt.sign(payload, secretKey, { expiresIn: '1h' }); // Token oluşturma
  },
  verifyToken: async (token) => {
    try {
      //  jwt.verify(token, secretKey); // Token doğrulama
      const decoded = jwt.verify(token,secretKey);
      return decoded;
    } catch (error) {
      throw new Error('Geçersiz token');
    }
  },
};
