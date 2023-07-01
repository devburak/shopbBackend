
const jwtConfig = require('../config/jwtConfig');

const jwtAuthMiddleware = (req, res, next) => {
  console.log('jwt')
  // Token doğrulama işlemini gerçekleştir
  const token = req.headers.authorization?.split(' ')[1] || '';
  try {
    if (!token && req.query.guestMail) {
      // Misafir kullanıcının talebi ise guestMail parametresini alıp req.user objesine ekle
      const guestMail = req.query.guestMail;
      req.user = { guestMail,role:"guest" ,userId:null};
      next();
    }else {
      const decoded = jwtConfig.verifyToken(token);
      const userId = decoded.userId;
      const role = decoded.role; // Kullanıcının rolünü al
      req.user = { userId, role }; // Kullanıcı kimliğini istek nesnesine ekle
      next();
    }
  } catch (error) {
    return res.status(401).json({ error: 'Geçersiz istek' });
  }
};

function isAdmin(req, res, next) {
  const { role ,userId} = req.user;
 
  if (role !== 'admin') {
    return res.status(403).json({ error: 'Bu işlem için yetkiniz yok' });
  }
  next();
}

function isAdminOrStaff(req, res, next) {
  const { role } = req.user;
  console.log(req.user)
  if (role !== 'admin' && role !== 'staff') {
    return res.status(403).json({ error: 'Yetkisiz erişim' });
  }
 next();

}

module.exports = {
  jwtAuthMiddleware,
  isAdmin,
  isAdminOrStaff
};