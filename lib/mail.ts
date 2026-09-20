// Gönderici e-posta adresi (Resend üzerinde doğrulanan domain)
const SENDER_EMAIL = 'DexX Shop <noreply@dexxshop.com>';

async function sendViaResendApi(payload: { to: string; subject: string; text: string; html: string }): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY tanımlı değil!');
    return false;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: SENDER_EMAIL,
        to: [payload.to],
        subject: payload.subject,
        text: payload.text,
        html: payload.html
      })
    });

    if (!res.ok) {
      const errData = await res.json();
      console.error('Resend API Hatası:', errData);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Resend fetch hatası:', err);
    return false;
  }
}

/**
 * 6 Haneli Doğrulama Kodu Gönderimi
 */
export async function sendVerificationCode(email: string, code: string): Promise<boolean> {
  return await sendViaResendApi({
    to: email,
    subject: `DexX Shop - E-Posta Doğrulama Kodunuz: ${code}`,
    text: `DexX Shop hesabınızı doğrulamak için tek kullanımlık güvenlik kodunuz: ${code}\n\nBu kodu kimseyle paylaşmayınız. Kod 10 dakika süreyle geçerlidir.`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #050505; color: #ffffff; margin: 0; padding: 40px 20px; }
          .container { max-width: 520px; margin: 0 auto; background-color: #0c0c0f; border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 36px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
          .logo { font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff; text-align: center; margin-bottom: 24px; }
          .logo span { color: #dc2626; }
          .title { font-size: 18px; font-weight: 700; color: #ffffff; text-align: center; margin-bottom: 12px; }
          .desc { font-size: 13px; color: #a1a1aa; line-height: 1.6; text-align: center; margin-bottom: 28px; }
          .code-box { background: rgba(220, 38, 38, 0.08); border: 1px solid rgba(220, 38, 38, 0.3); border-radius: 14px; padding: 18px; text-align: center; font-size: 32px; font-weight: 800; font-family: monospace; letter-spacing: 8px; color: #f87171; margin-bottom: 28px; }
          .footer { font-size: 11px; color: #52525b; text-align: center; border-top: 1px solid rgba(255,255,255,0.05); margin-top: 24px; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">DexX<span>Shop</span></div>
          <div class="title">E-Posta Adresinizi Doğrulayın</div>
          <div class="desc">DexX Shop üyeliğinizi tamamlamak için aşağıdaki 6 haneli tek kullanımlık güvenlik kodunu doğrulama alanına giriniz:</div>
          <div class="code-box">${code}</div>
          <div class="desc" style="font-size: 12px; margin-bottom: 0;">Bu işlemi siz talep etmediyseniz bu e-postayı güvenle göz ardı edebilirsiniz. Kod 10 dakika geçerlidir.</div>
          <div class="footer">© 2026 DexX Shop. Tüm hakları saklıdır.</div>
        </div>
      </body>
      </html>
    `
  });
}

/**
 * Şifre Sıfırlama Bağlantısı Gönderimi
 */
export async function sendPasswordResetMail(email: string, resetLink: string): Promise<boolean> {
  return await sendViaResendApi({
    to: email,
    subject: 'DexX Shop - Şifre Sıfırlama Talebi',
    text: `Hesabınızın şifresini sıfırlamak için bağlantıya tıklayınız:\n${resetLink}\n\nBu bağlantı 15 dakika geçerlidir.`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #050505; color: #ffffff; margin: 0; padding: 40px 20px; }
          .container { max-width: 520px; margin: 0 auto; background-color: #0c0c0f; border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 36px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
          .logo { font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff; text-align: center; margin-bottom: 24px; }
          .logo span { color: #dc2626; }
          .title { font-size: 18px; font-weight: 700; color: #ffffff; text-align: center; margin-bottom: 12px; }
          .desc { font-size: 13px; color: #a1a1aa; line-height: 1.6; text-align: center; margin-bottom: 28px; }
          .btn-wrap { text-align: center; margin-bottom: 28px; }
          .btn { background: #dc2626; color: #ffffff !important; padding: 14px 28px; border-radius: 12px; font-weight: 700; font-size: 13px; text-decoration: none; display: inline-block; }
          .footer { font-size: 11px; color: #52525b; text-align: center; border-top: 1px solid rgba(255,255,255,0.05); margin-top: 24px; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">DexX<span>Shop</span></div>
          <div class="title">Şifrenizi Sıfırlayın</div>
          <div class="desc">DexX Shop hesabınız için şifre sıfırlama talebinde bulundunuz. Yeni bir şifre belirlemek için aşağıdaki butona tıklayın:</div>
          <div class="btn-wrap">
            <a href="${resetLink}" class="btn" target="_blank">Yeni Şifre Belirle</a>
          </div>
          <div class="desc" style="font-size: 12px; margin-bottom: 0;">Bu işlemi siz talep etmediyseniz hesabınız güvendedir, hiçbir işlem yapmanıza gerek yoktur. Bağlantı 15 dakika geçerlidir.</div>
          <div class="footer">© 2026 DexX Shop. Tüm hakları saklıdır.</div>
        </div>
      </body>
      </html>
    `
  });
}