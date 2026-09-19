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
          <p style="font-size: 12px; color: #737373;">Bu bağlantı 15 dakika boyunca geçerlidir.</p>
        </div>
      `
    });
    return true;
  } catch (error) {
    console.error('Mail gönderme hatası:', error);
    return false;
  }
}

// Sipariş Kodu ve Discord Ticket Yönlendirmeli E-posta
export async function sendLicenseEmail(to: string, productTitle: string, tier: string, orderCode: string): Promise<boolean> {
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    console.log(`\n========================================`);
    console.log(`[TEST MODU] ${to} İçin Sipariş Oluşturuldu:`);
    console.log(`Ürün: ${productTitle} (${tier})`);
    console.log(`Sipariş Kodu: ${orderCode}`);
    console.log(`========================================\n`);
    return true;
  }

  try {
    await transporter.sendMail({
      from: `"DexX Shop" <${process.env.SMTP_EMAIL}>`,
      to,
      subject: `DexX Shop - Siparişiniz Alındı: ${orderCode}`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #09090b; color: #ffffff; padding: 32px; border-radius: 16px; max-width: 540px; margin: auto; border: 1px solid #27272a;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #ef4444; margin: 0; font-size: 24px; font-weight: 800;">Siparişiniz Onaylandı!</h2>
            <p style="color: #a1a1aa; font-size: 13px; margin-top: 6px;">Size özel temiz lisans ve loader erişiminiz hazırlandı.</p>
          </div>

          <div style="background-color: #18181b; border: 1px solid #3f3f46; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0 0 4px 0; font-size: 11px; color: #71717a; text-transform: uppercase;">Satın Alınan Ürün</p>
            <h3 style="margin: 0 0 6px 0; font-size: 18px; color: #ffffff;">${productTitle}</h3>
            <span style="color: #ef4444; font-size: 12px; font-weight: bold; background: rgba(239,68,68,0.1); padding: 3px 8px; border-radius: 6px; border: 1px solid rgba(239,68,68,0.2);">
              Paket: ${tier}
            </span>

            <div style="margin-top: 20px; padding: 14px; background-color: #09090b; border: 1px dashed #ef4444; border-radius: 10px; text-align: center;">
              <p style="margin: 0 0 4px 0; font-size: 11px; color: #a1a1aa; text-transform: uppercase; font-weight: bold;">Sipariş / Doğrulama Kodunuz</p>
              <code style="font-size: 20px; color: #ef4444; font-weight: 900; letter-spacing: 2px;">${orderCode}</code>
            </div>
          </div>

          <div style="background-color: #111114; border: 1px solid #27272a; border-radius: 12px; padding: 18px; margin-bottom: 24px;">
            <h4 style="margin: 0 0 8px 0; font-size: 13px; color: #ffffff;">📌 Lisansınızı ve Kurulum Dosyalarını Nasıl Alırsınız?</h4>
            <ol style="margin: 0; padding-left: 18px; color: #d4d4d8; font-size: 12px; line-height: 1.7;">
              <li>Aşağıdaki butona tıklayarak resmi <strong>DexX Discord</strong> sunucumuza katılın.</li>
              <li><strong>#ticket-oluştur</strong> kanalından bir destek bileti açın.</li>
              <li>Yukarıdaki <strong>${orderCode}</strong> sipariş kodunuzu yetkiliye iletin.</li>
              <li>Temiz lisans anahtarınız ve özel hile kurulum dosyanız anında teslim edilsin!</li>
            </ol>
          </div>

          <div style="text-align: center; margin-bottom: 20px;">
            <a href="https://discord.gg/P4hymgPn3R" style="background: linear-gradient(135deg, #ef4444, #b91c1c); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block; font-size: 13px; letter-spacing: 0.5px;">
              DISCORD'DA TICKET AÇ VE TESLİM AL →
            </a>
          </div>

          <hr style="border: 0; border-top: 1px solid #27272a; margin: 20px 0;" />
          <p style="color: #71717a; font-size: 11px; text-align: center; margin: 0;">
            DexX Shop VIP Çözümleri • 7/24 Discord Canlı Destek
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