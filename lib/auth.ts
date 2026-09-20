import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { cookies } from 'next/headers';
import { sendPasswordResetMail, sendVerificationCode } from './mail';

export type UserRole = 'owner' | 'admin' | 'moderator' | 'user';

export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  refCode?: string;
  passwordHash: string;
  role?: UserRole;
  adminSince?: string;
  lastActive?: string;
  createdAt: string;
}

// Supabase Admin İstemcisi (Service Role veya Anon Key ile)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// PROJENİN ASIL KURUCU / SÜPER ADMİN E-POSTASI:
export const SUPER_ADMIN_EMAIL = 'dexxmarkett@gmail.com';

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function getUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabase.from('users').select('*');
    if (error || !data) return [];
    return data as User[];
  } catch {
    return [];
  }
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const cleanEmail = email.toLowerCase().trim();
  const { data } = await supabase
    .from('users')
    .select('*')
    .ilike('email', cleanEmail)
    .maybeSingle();

  return (data as User) || null;
}

export async function findUserByUsername(username: string): Promise<User | null> {
  const search = (username || '').toLowerCase().trim();
  const { data } = await supabase
    .from('users')
    .select('*')
    .ilike('username', search)
    .maybeSingle();

  return (data as User) || null;
}

export async function initiateRegistration(data: {
  fullName: string;
  username: string;
  email: string;
  password: string;
  refCode?: string;
}): Promise<{ success: boolean; error?: string }> {
  const cleanEmail = data.email.toLowerCase().trim();
  const cleanUsername = data.username.toLowerCase().trim();

  if (!cleanEmail.endsWith('@gmail.com')) {
    return { success: false, error: 'Lütfen geçerli bir Gmail adresi girin (@gmail.com).' };
  }
  if (data.password.length < 6) {
    return { success: false, error: 'Şifre en az 6 karakter olmalıdır.' };
  }

  const existingEmail = await findUserByEmail(cleanEmail);
  if (existingEmail) return { success: false, error: 'Bu Gmail adresi zaten kayıtlı.' };

  const existingUser = await findUserByUsername(cleanUsername);
  if (existingUser) return { success: false, error: 'Bu kullanıcı adı zaten alınmış.' };

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // RAM yerine doğrudan veritabanına yazıyoruz (Vercel sunucuları değişse de kaybolmaz)
  await supabase.from('pending_verifications').upsert({
    email: cleanEmail,
    fullName: data.fullName.trim(),
    username: cleanUsername,
    passwordHash: hashPassword(data.password),
    refCode: data.refCode?.trim() || '',
    code,
    expiresAt: Date.now() + 10 * 60 * 1000
  });

  const mailSent = await sendVerificationCode(cleanEmail, code);
  if (!mailSent) return { success: false, error: 'Doğrulama kodu gönderilemedi.' };

  return { success: true };
}

export async function verifyAndCreateUser(email: string, inputCode: string): Promise<{ success: boolean; error?: string }> {
  const cleanEmail = email.toLowerCase().trim();

  const { data: pending } = await supabase
    .from('pending_verifications')
    .select('*')
    .eq('email', cleanEmail)
    .maybeSingle();

  if (!pending) return { success: false, error: 'Kayıt talebi bulunamadı veya süresi doldu.' };
  if (Date.now() > Number(pending.expiresAt)) {
    await supabase.from('pending_verifications').delete().eq('email', cleanEmail);
    return { success: false, error: 'Kodun süresi dolmuş.' };
  }
  if (pending.code !== inputCode.trim()) return { success: false, error: 'Hatalı doğrulama kodu.' };

  const isSuperAdmin = cleanEmail === SUPER_ADMIN_EMAIL.toLowerCase();

  const newUser: User = {
    id: Date.now().toString(),
    fullName: pending.fullName,
    username: pending.username,
    email: pending.email,
    refCode: pending.refCode,
    passwordHash: pending.passwordHash,
    role: isSuperAdmin ? 'owner' : 'user',
    adminSince: isSuperAdmin ? new Date().toISOString() : undefined,
    lastActive: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };

  const { error } = await supabase.from('users').insert([newUser]);
  if (error) return { success: false, error: 'Kullanıcı kaydedilemedi: ' + error.message };

  await supabase.from('pending_verifications').delete().eq('email', cleanEmail);

  return { success: true };
}

export async function createPasswordResetRequest(email: string, origin: string): Promise<{ success: boolean; error?: string }> {
  const cleanEmail = email.toLowerCase().trim();
  const user = await findUserByEmail(cleanEmail);
  if (!user) return { success: false, error: 'Bu e-posta adresine ait bir hesap bulunamadı.' };

  const token = crypto.randomBytes(32).toString('hex');
  await supabase.from('reset_tokens').upsert({
    token,
    email: cleanEmail,
    expiresAt: Date.now() + 15 * 60 * 1000
  });

  const resetLink = `${origin}/reset-password?token=${token}`;
  const sent = await sendPasswordResetMail(cleanEmail, resetLink);
  if (!sent) return { success: false, error: 'E-posta gönderilemedi.' };

  return { success: true };
}

export async function resetPasswordWithToken(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  const { data: session } = await supabase
    .from('reset_tokens')
    .select('*')
    .eq('token', token)
    .maybeSingle();

  if (!session) return { success: false, error: 'Geçersiz bağlantı.' };
  if (Date.now() > Number(session.expiresAt)) {
    await supabase.from('reset_tokens').delete().eq('token', token);
    return { success: false, error: 'Bağlantının süresi dolmuş.' };
  }
  if (newPassword.length < 6) return { success: false, error: 'Şifre en az 6 karakter olmalıdır.' };

  const user = await findUserByEmail(session.email);
  if (!user) return { success: false, error: 'Kullanıcı bulunamadı.' };

  const { error } = await supabase
    .from('users')
    .update({ passwordHash: hashPassword(newPassword) })
    .eq('email', session.email.toLowerCase());

  if (error) return { success: false, error: 'Şifre güncellenemedi.' };

  await supabase.from('reset_tokens').delete().eq('token', token);

  return { success: true };
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get('user_session')?.value;
  if (!session) return null;

  try {
    const decoded = JSON.parse(Buffer.from(session, 'base64').toString('utf-8'));
    if (!decoded.email) return null;
    const user = await findUserByEmail(decoded.email);
    if (!user) return null;

    if (user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() && user.role !== 'owner') {
      user.role = 'owner';
      user.adminSince = user.adminSince || user.createdAt;
    }
    return user;
  } catch {
    return null;
  }
}

// Admin İşlemleri
export async function getAdminUsers(): Promise<User[]> {
  const users = await getUsers();
  return users.filter(
    (u) =>
      u.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() ||
      u.role === 'owner' ||
      u.role === 'admin' ||
      u.role === 'moderator'
  );
}

export async function assignAdminRole(email: string, role: 'admin' | 'moderator'): Promise<{ success: boolean; error?: string }> {
  const cleanEmail = email.toLowerCase().trim();
  const user = await findUserByEmail(cleanEmail);

  if (!user) {
    return { success: false, error: 'Bu Gmail adresine sahip kayıtlı kullanıcı bulunamadı.' };
  }

  if (user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
    return { success: false, error: 'Kurucu hesap rolü değiştirilemez.' };
  }

  const { error } = await supabase
    .from('users')
    .update({
      role,
      adminSince: user.adminSince || new Date().toISOString()
    })
    .eq('email', cleanEmail);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function revokeAdminRole(userId: string): Promise<{ success: boolean; error?: string }> {
  const { data: user } = await supabase.from('users').select('*').eq('id', userId).maybeSingle();

  if (!user) return { success: false, error: 'Kullanıcı bulunamadı.' };
  if (user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
    return { success: false, error: 'Kurucu yöneticinin yetkisi alınamaz.' };
  }

  const { error } = await supabase
    .from('users')
    .update({ role: 'user', adminSince: null })
    .eq('id', userId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}