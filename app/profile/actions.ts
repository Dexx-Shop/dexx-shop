'use server';

import fs from 'fs';
import { getCurrentUser, hashPassword } from 'lib/auth';
import { activateLicenseKey, getUserBalance, redeemCoupon } from 'lib/wallet';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import path from 'path';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');
const LICENSES_FILE = path.join(process.cwd(), 'data', 'licenses.json');

// 1. ŞİFRE DEĞİŞTİRME SERVER ACTION (auth.ts hashPassword ile tam uyumlu)
export async function changePasswordAction(formData: FormData) {
  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: 'Lütfen tüm şifre alanlarını doldurun.' };
  }

  if (newPassword !== confirmPassword) {
    return { error: 'Yeni şifreler birbiriyle uyuşmuyor.' };
  }

  if (newPassword.length < 6) {
    return { error: 'Yeni şifre en az 6 karakter olmalıdır.' };
  }

  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { error: 'Oturum bulunamadı. Lütfen tekrar giriş yapın.' };
  }

  try {
    if (!fs.existsSync(USERS_FILE)) {
      return { error: 'Kullanıcı veritabanı bulunamadı.' };
    }

    const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
    const userIndex = users.findIndex(
      (u: any) => u.id === currentUser.id || u.email?.toLowerCase() === currentUser.email?.toLowerCase()
    );

    if (userIndex === -1) {
      return { error: 'Kullanıcı kaydı bulunamadı.' };
    }

    // Mevcut şifrenin hash kontrolü
    const currentHash = hashPassword(currentPassword);
    if (users[userIndex].passwordHash !== currentHash) {
      return { error: 'Mevcut şifrenizi hatalı girdiniz.' };
    }

    // Yeni şifrenin hash'ini kaydet
    users[userIndex].passwordHash = hashPassword(newPassword);
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');

    return { success: true, message: 'Şifreniz başarıyla güncellendi!' };
  } catch {
    return { error: 'Şifre güncellenirken bir hata oluştu.' };
  }
}

// 2. KUPON BOZDURMA
export async function redeemCouponAction(code: string) {
  if (!code || !code.trim()) {
    return { error: 'Lütfen bir bakiye kodu girin.' };
  }

  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { error: 'Oturum bulunamadı. Lütfen giriş yapın.' };
  }

  try {
    const result = await redeemCoupon(currentUser.id, code.trim());

    if (!result.success) {
      return { error: result.error || 'Geçersiz veya kullanılmış bakiye kodu.' };
    }

    const updatedBalance = await getUserBalance(currentUser.id);

    return {
      success: true,
      message: `$${Number(result.amount || 0).toFixed(2)} bakiye cüzdanınıza tanımlandı!`,
      newBalance: Number(updatedBalance).toFixed(2)
    };
  } catch (err: any) {
    return { error: err.message || 'Kupon tanımlanırken bir hata meydana geldi.' };
  }
}

// 3. LİSANS ANAHTARI TANIMLAMA
export async function activateLicenseAction(keyInput: string) {
  if (!keyInput || !keyInput.trim()) {
    return { error: 'Lütfen geçerli bir lisans anahtarı girin.' };
  }

  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { error: 'Oturum bulunamadı.' };
  }

  try {
    const result = await activateLicenseKey(currentUser.id, keyInput.trim());

    if (!result.success) {
      return { error: result.error || 'Lisans anahtarı aktifleştirilemedi.' };
    }

    return {
      success: true,
      message: 'Lisans anahtarı başarıyla hesabınıza tanımlandı!',
      license: result.license
    };
  } catch (err: any) {
    return { error: err.message || 'Lisans işlenirken bir hata oluştu.' };
  }
}

// 4. LİSANS SİLME SERVER ACTION
export async function deleteLicenseAction(licenseId: string, licenseKey: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { error: 'Oturum bulunamadı.' };
  }

  try {
    if (!fs.existsSync(LICENSES_FILE)) {
      return { error: 'Lisans dosyası bulunamadı.' };
    }

    const licenses = JSON.parse(fs.readFileSync(LICENSES_FILE, 'utf-8'));
    
    // Kullanıcının kendi lisansı olan kaydı filtreleyip sil
    const filteredLicenses = licenses.filter((l: any) => {
      const match = (l.id && l.id === licenseId) || (l.key && l.key === licenseKey);
      if (match && l.userId === currentUser.id) {
        return false;
      }
      return true;
    });

    fs.writeFileSync(LICENSES_FILE, JSON.stringify(filteredLicenses, null, 2), 'utf-8');

    return { success: true, message: 'Lisans başarıyla silindi.' };
  } catch (err: any) {
    return { error: err.message || 'Lisans silinirken bir hata oluştu.' };
  }
}

// 5. KESİN ÇIKIŞ YAP (auth.ts user_session çerezini sıfırlar)
export async function logoutAction() {
  const cookieStore = await cookies();
  
  // Asıl oturum çerezini siliyoruz:
  cookieStore.delete('user_session');

  // Varsa diğer çerezleri de temizle
  cookieStore.delete('token');
  cookieStore.delete('auth_token');
  cookieStore.delete('session');

  redirect('/login');
}