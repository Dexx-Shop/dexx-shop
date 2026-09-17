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

// Yeni: Satın Alınan Lisans Anahtarını Gönderen Fonksiyon
export async function sendLicenseEmail(to: string, productTitle: string, tier: string, licenseKey: string): Promise<boolean> {
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    console.log(`\n========================================`);
    console.log(`[TEST MODU] ${to} İçin Satın Alınan Lisans:`);
    console.log(`Ürün: ${productTitle} (${tier})`);
    console.log(`Key: ${licenseKey}`);
    console.log(`========================================\n`);
    return true;
  }

  try {
    await transporter.sendMail({
      from: `"DexX Shop" <${process.env.SMTP_EMAIL}>`,
      to,
      subject: `DexX Shop - Lisans Teslimatı: ${productTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #09090b; color: #ffffff; padding: 30px; border-radius: 16px; max-width: 540px; margin: auto; border: 1px solid #27272a;">
          <h2 style="color: #ef4444; margin-bottom: 8px; font-size: 22px;">Siparişiniz Tamamlandı!</h2>
          <p style="color: #a1a1aa; font-size: 14px; line-height: 1.5;">
            Merhaba, <strong>DexX Shop</strong> üzerinden yaptığınız alışveriş onaylandı. Dijital lisans anahtarınız aşağıdadır:
          </p>

          <div style="background-color: #18181b; border: 1px solid #3f3f46; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0 0 6px 0; font-size: 11px; color: #71717a; text-transform: uppercase;">Ürün & Paket</p>
            <h3 style="margin: 0 0 4px 0; font-size: 17px; color: #ffffff;">${productTitle}</h3>
            <span style="color: #ef4444; font-size: 13px; font-weight: bold;">Süre: ${tier}</span>

            <div style="margin-top: 16px; padding: 14px; background-color: #09090b; border: 1px dashed #ef4444; border-radius: 8px; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 11px; color: #a1a1aa; text-transform: uppercase;">Lisans Anahtarınız</p>
              <code style="font-size: 16px; color: #ef4444; font-weight: bold; letter-spacing: 1.5px;">${licenseKey}</code>
            </div>
          </div>

          <p style="color: #a1a1aa; font-size: 13px; line-height: 1.5;">
            Bu anahtarı profilinizdeki <strong>"Lisans Anahtarı Tanımla"</strong> kutusuna girerek üyeliğinizi hemen başlatabilirsiniz.
          </p>

          <hr style="border: 0; border-top: 1px solid #27272a; margin: 20px 0;" />
          <p style="color: #71717a; font-size: 11px; text-align: center; margin: 0;">
            Teknik destek ve kurulum için Discord: <a href="https://discord.gg/P4hymgPn3R" style="color: #ef4444; text-decoration: none;">https://discord.gg/P4hymgPn3R</a>
          </p>
        </div>
      `
    });
    return true;
  } catch (error) {
    console.error('Lisans maili gönderme hatası:', error);
    return false;
  }
}