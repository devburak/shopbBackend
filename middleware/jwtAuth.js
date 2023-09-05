

const RevokedToken = require('../db/models/token'); // RevokedToken modelini projenize göre yolunuza göre ayarlayın
const jwtConfig = require('../config/jwtConfig');


const jwtAuthMiddleware = async (req, res, next) => {
  // Token doğrulama işlemini gerçekleştir
  const token = req.headers.authorization?.split(' ')[1] || '';
  try {
    if (!token && req.query.guestMail) {
      // Misafir kullanıcının talebi ise guestMail parametresini alıp req.user objesine ekle
      const guestMail = req.query.guestMail;
      req.user = { guestMail,role:"guest" ,userId:null};
      next();
    }else {
      const tokenInRevocationList = await checkTokenInRevocationList(token); // Örnek bir fonksiyon
      if (tokenInRevocationList) {
        throw new Error('Token has been revoked');
      }
      const decoded = await jwtConfig.verifyToken(token);
      console.log(decoded)
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
  if (role !== 'admin' && role !== 'staff') {
    return res.status(403).json({ error: 'Yetkisiz erişim' });
  }
 next();

}

async function addToRevocationList(tokenId) {
  try {
    const revokedToken = new RevokedToken({ tokenId });
    await revokedToken.save();
    console.log('Token revoked:', tokenId);
  } catch (error) {
    console.error('Revocation error:', error);
  }
}

const checkTokenInRevocationList = async (tokenId) => {
  const tokenInList = await RevokedToken.exists({tokenId:tokenId });
  return tokenInList;
};

module.exports = {
  jwtAuthMiddleware,
  isAdmin,
  isAdminOrStaff,
  addToRevocationList,
  checkTokenInRevocationList
};