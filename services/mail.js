const nodemailer = require('nodemailer');
require('dotenv').config();

async function sendEmail(to, subject, htmlContent) {
  try {
    // E-posta göndermek için kullanacağımız SMTP sağlayıcısını ayarlayın
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER_NAME, 
        pass: process.env.EMAIL_PASSWORD 
      }
    });

    // E-posta gönderme seçeneklerini yapılandırın
    const mailOptions = {
      from: process.env.EMAIL_FROM, // Gönderenin e-posta adresi
      to: to, // Alıcının e-posta adresi
      subject: subject, // E-posta konusu
      html: htmlContent // E-posta içeriği (HTML formatında)
    };

    // E-postayı gönderin
    const info = await transporter.sendMail(mailOptions);
    console.log('E-posta gönderildi:', info.messageId);
  } catch (error) {
    console.error('E-posta gönderilirken hata oluştu:', error);
  }
}

// // Örnek kullanım
// const toEmail = 'burak.imrek@ikon-x.com.tr'; // Alıcının e-posta adresi
// const subject = 'Merhaba'; // E-posta konusu
// const htmlContent = '<h1>Merhaba!</h1><p>Bu bir test e-postasıdır.</p>'; // E-posta içeriği (HTML formatında)

// sendEmail(toEmail, subject, htmlContent);


module.exports = {sendEmail}