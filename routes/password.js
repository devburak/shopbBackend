const express = require('express');
const router = express.Router();
const User = require('../db/models/user');
const PasswordReset = require('../db/models/passwordReset');
const { generateAndSaveResetCode } = require('../services/passwordCode');
const {sendEmail} =require('../services/mail')
const {formatDate} = require('../utils/date')
const fs = require('fs');
const path = require('path');

const bcrypt = require('bcryptjs');

router.post('/forget', async (req, res) => {
  try {
      // Dosya yolu
      const templatePath = path.join(__dirname, '../htmltemplates/reset_password_template.html');

      // E-posta şablonunu dosyadan okuma ve `resetPasswordEmailTemplate` değişkenine atama
      const resetPasswordEmailTemplate = fs.readFileSync(templatePath, 'utf-8');
      const { email } = req.body;

    // Kullanıcıyı e-posta adresine göre bulma
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    

    // Şifre sıfırlama kodu oluşturma ve veritabanına kaydetme
    const resetCode = await generateAndSaveResetCode(user._id);
    const expireTime = process.env.PASSWORD_CODE_EXPIRE || 2
    // E-posta içeriği oluşturma
    const resetLink = `${process.env.RESET_PASSWORD_LINK}?code=${resetCode}`;
    const emailContent = resetPasswordEmailTemplate
      .replace('{resetCode}', resetCode)
      .replace('{resetLink}', resetLink)
      .replace('{expire}', expireTime);

    // Burada şifre sıfırlama kodunu kullanarak kullanıcıya e-posta gönderilebilir
    sendEmail(email , 'reset Password code',emailContent )
    // Örnek olarak e-posta içeriği oluşturup kullanıcıya gönderme işlemleri yapılabilir

    res.status(200).json({ message: 'Şifre sıfırlama kodu oluşturuldu' });
  } catch (error) {
    console.error('Şifre sıfırlama isteği hatası:', error);
    res.status(500).json({ error: 'Bir hata oluştu' });
  }
});


// router.post('/regenerate', async (req, res) => {
//   try {
//     const { email, resetCode, newPassword } = req.body;

//     // Kullanıcıyı e-posta adresine göre bulma
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
//     }

//     // Şifre sıfırlama kodunu veritabanında kontrol etme
//     const passwordReset = await PasswordReset.findOne({ userId: user._id, resetCode });
//     if (!passwordReset || passwordReset.expiration < new Date()) {
//       return res.status(400).json({ error: 'Geçersiz şifre sıfırlama kodu' });
//     }

//     // Şifreyi güncelleme
//     user.password = newPassword;
//     await user.save();

//     // Şifre sıfırlama kodunu veritabanından silme
//     await passwordReset.remove();



//     res.status(200).json({ message: 'Şifre başarıyla yenilendi' });
//   } catch (error) {
//     console.error('Şifre yenileme hatası:', error);
//     res.status(500).json({ error: 'Bir hata oluştu' });
//   }
// });



router.post('/regenerate', async (req, res) => {
    try {
        const { email, resetCode, newPassword } = req.body;
        // Dosya yolu
        const templatePath = path.join(__dirname, '../htmltemplates/info_password_template.html');

        // E-posta şablonunu dosyadan okuma ve `resetPasswordEmailTemplate` değişkenine atama
        const resetPasswordEmailTemplate = fs.readFileSync(templatePath, 'utf-8');
        // Kullanıcıyı e-posta adresine göre bulma
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
        }

        // Şifre sıfırlama kodunu veritabanında kontrol etme
        const passwordReset = await PasswordReset.findOne({ userId: user._id, resetCode });
        if (!passwordReset || passwordReset.expiration < new Date()) {
            return res.status(400).json({ error: 'Geçersiz şifre sıfırlama kodu' });
        }

        const isSamePassword = bcrypt.compareSync(newPassword, user.password);
        if (isSamePassword) {
            return res.status(400).json({ error: 'Yeni şifre, eski şifre ile aynı olamaz' });
        }
        // Şifreyi güncelleme
        user.password = newPassword;
        await user.save();

        // Şifre sıfırlama zamanını güncelleme
        passwordReset.resetTime = new Date();
        const formattedResetTime = formatDate(passwordReset.resetTime);
        passwordReset.expiration = new Date();
        await passwordReset.save();

        // Şifre sıfırlama kodunu veritabanından silme (Opsiyonel, ihtiyacınıza göre kaldırabilirsiniz)
        // await passwordReset.remove();

        // Kullanıcıya bilgilendirme e-postası gönderme
        const info_mail = process.env.INFO_MAIL || ""
        const emailContent = resetPasswordEmailTemplate
            .replace('{resetTime}', formattedResetTime)
            .replace('{infoEmail}', info_mail);

        sendEmail(email, 'Password Reset Confirmation', emailContent)

        res.status(200).json({ message: 'Şifre başarıyla yenilendi ve bilgilendirme e-postası gönderildi' });
    } catch (error) {
        console.error('Şifre yenileme hatası:', error);
        res.status(500).json({ error: 'Bir hata oluştu' });
    }
});
module.exports = router;
