const jwt = require('jsonwebtoken');
// const secretKey = process.env.JWT_SECRET; // JWT için gizli anahtar
const {secretKey , jwtExpire} =require('./loadConfiguration')

module.exports = {
  generateToken: (payload) => {
    return jwt.sign(payload, secretKey, { expiresIn: jwtExpire }); // Token oluşturma
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
