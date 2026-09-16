import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD
  }
});

export async function sendVerificationCode(email: string, code: string): Promise<boolean> {
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    console.log(`\n========================================`);
    console.log(`[TEST MODU] ${email} için Doğrulama Kodu: ${code}`);
    console.log(`========================================\n`);
    return true;
  }

  try {
    await transporter.sendMail({
      from: `"DexX Shop" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: 'DexX Shop - E-posta Doğrulama Kodunuz',
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 24px; border-radius: 12px; max-width: 480px; margin: auto;">
          <h2 style="color: #ef4444; margin-bottom: 8px;">DexX Shop Doğrulama Kodu</h2>
          <p style="font-size: 14px; color: #a3a3a3;">Hesabınızı aktive etmek için aşağıdaki 6 haneli kodu kullanın:</p>
          <div style="background-color: #171717; border: 1px solid #262626; border-radius: 8px; text-align: center; padding: 18px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #ef4444;">${code}</span>
          </div>
          <p style="font-size: 12px; color: #737373;">Bu kod 10 dakika boyunca geçerlidir.</p>
        </div>
      `
    });
    return true;
  } catch (error) {
    console.error('Mail gönderme hatası:', error);
    return false;
  }
}

export async function sendPasswordResetMail(email: string, resetLink: string): Promise<boolean> {
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    console.log(`\n========================================`);
    console.log(`[TEST MODU] ${email} Şifre Sıfırlama Linki:`);
    console.log(resetLink);
    console.log(`========================================\n`);
    return true;
  }

  try {
    await transporter.sendMail({
      from: `"DexX Shop" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: 'DexX Shop - Şifre Sıfırlama Talebi',
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 28px; border-radius: 12px; max-width: 500px; margin: auto; border: 1px solid #262626;">
          <h2 style="color: #ef4444; margin-bottom: 12px;">Şifre Sıfırlama</h2>
          <p style="font-size: 14px; color: #d4d4d4; line-height: 1.5;">Hesabınız için şifre sıfırlama talebinde bulundunuz. Yeni şifrenizi belirlemek için aşağıdaki bağlantıya tıklayın:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #dc2626; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 14px;">Şifremi Sıfırla</a>
          </div>
          <p style="font-size: 12px; color: #737373;">Bu bağlantı 15 dakika boyunca geçerlidir. Talebi siz yapmadıysanız lütfen bu e-postayı dikkate almayın.</p>
        </div>
      `
    });
    return true;
  } catch (error) {
    console.error('Mail gönderme hatası:', error);
    return false;
  }
}