const crypto = require('crypto');
const moment = require('moment');
const PasswordReset = require('../db/models/passwordReset');

// Şifre sıfırlama kodu oluşturma ve veritabanına kaydetme
const generateAndSaveResetCode = async (userId) => {
  try {
    // Şifre sıfırlama kodunu oluşturma
    const resetCode = crypto.randomBytes(6).toString('hex'); // 12 karakterlik alfanumerik kod

    // Şifre sıfırlama kodunun geçerlilik süresini hesaplama (2 saat)
    const expiration = moment().add(process.env.PASSWORD_CODE_EXPIRE, 'hours').toDate();

    // Şifre sıfırlama kaydını veritabanına kaydetme
    const passwordReset = new PasswordReset({
      userId: userId,
      resetCode: resetCode,
      expiration: expiration
    });
    await passwordReset.save();

    return resetCode;
  } catch (error) {
    console.error('Şifre sıfırlama kodu oluşturma hatası:', error);
    throw error;
  }
};

module.exports = {generateAndSaveResetCode}