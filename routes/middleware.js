
const jwtConfig = require('../config/jwtConfig');

const jwtAuthMiddleware = (req, res, next) => {
  // Token doğrulama işlemini gerçekleştir
  const token = req.headers.authorization.split(' ')[1];
  try {
    const decoded = jwtConfig.verifyToken(token);
    const userId = decoded.userId;
    const role = decoded.role; // Kullanıcının rolünü al
    req.user = { userId,role }; // Kullanıcı kimliğini istek nesnesine ekle
    next();
  } catch (error) {
    res.status(401).json({ error: 'Geçersiz token' });
  }
};

module.exports = jwtAuthMiddleware;
