import crypto from 'crypto';
import fs from 'fs';
import { cookies } from 'next/headers';
import path from 'path';
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

interface PendingRegistration {
  fullName: string;
  username: string;
  email: string;
  passwordHash: string;
  refCode?: string;
  code: string;
  expiresAt: number;
}

interface PasswordResetToken {
  email: string;
  expiresAt: number;
}

const pendingVerifications = new Map<string, PendingRegistration>();
const resetTokens = new Map<string, PasswordResetToken>();


// PROJENİN ASIL KURUCU / SÜPER ADMİN E-POSTASI:
export const SUPER_ADMIN_EMAIL = 'dexxmarkett@gmail.com';

const usersFilePath = path.join(process.cwd(), 'data', 'users.json');

function ensureUsersFile() {
  const dir = path.dirname(usersFilePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(usersFilePath)) fs.writeFileSync(usersFilePath, JSON.stringify([]), 'utf-8');
}

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function getUsers(): Promise<User[]> {
  ensureUsersFile();
  try {
    const data = fs.readFileSync(usersFilePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const users = await getUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim()) || null;
}

export async function findUserByUsername(username: string): Promise<User | null> {
  const users = await getUsers();
  const search = (username || '').toLowerCase().trim();
  return users.find((u) => u.username && u.username.toLowerCase() === search) || null;
}

export async function initiateRegistration(data: {
  fullName: string;
  username: string;
  email: string;
  password: string;
  refCode?: string;
}): Promise<{ success: boolean; error?: string }> {
  ensureUsersFile();
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

  pendingVerifications.set(cleanEmail, {
    fullName: data.fullName.trim(),
    username: cleanUsername,
    email: cleanEmail,
    refCode: data.refCode?.trim() || '',
    passwordHash: hashPassword(data.password),
    code,
    expiresAt: Date.now() + 10 * 60 * 1000
  });

  const mailSent = await sendVerificationCode(cleanEmail, code);
  if (!mailSent) return { success: false, error: 'Doğrulama kodu gönderilemedi.' };

  return { success: true };
}

export async function verifyAndCreateUser(email: string, inputCode: string): Promise<{ success: boolean; error?: string }> {
  ensureUsersFile();
  const cleanEmail = email.toLowerCase().trim();
  const pending = pendingVerifications.get(cleanEmail);

  if (!pending) return { success: false, error: 'Kayıt talebi bulunamadı veya süresi doldu.' };
  if (Date.now() > pending.expiresAt) {
    pendingVerifications.delete(cleanEmail);
    return { success: false, error: 'Kodun süresi dolmuş.' };
  }
  if (pending.code !== inputCode.trim()) return { success: false, error: 'Hatalı doğrulama kodu.' };

  const users = await getUsers();
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

  users.push(newUser);
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
  pendingVerifications.delete(cleanEmail);

  return { success: true };
}

export async function createPasswordResetRequest(email: string, origin: string): Promise<{ success: boolean; error?: string }> {
  const cleanEmail = email.toLowerCase().trim();
  const user = await findUserByEmail(cleanEmail);
  if (!user) return { success: false, error: 'Bu e-posta adresine ait bir hesap bulunamadı.' };

  const token = crypto.randomBytes(32).toString('hex');
  resetTokens.set(token, {
    email: cleanEmail,
    expiresAt: Date.now() + 15 * 60 * 1000
  });

  const resetLink = `${origin}/reset-password?token=${token}`;
  const sent = await sendPasswordResetMail(cleanEmail, resetLink);
  if (!sent) return { success: false, error: 'E-posta gönderilemedi.' };

  return { success: true };
}

export async function resetPasswordWithToken(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  const session = resetTokens.get(token);
  if (!session) return { success: false, error: 'Geçersiz bağlantı.' };
  if (Date.now() > session.expiresAt) {
    resetTokens.delete(token);
    return { success: false, error: 'Bağlantının süresi dolmuş.' };
  }
  if (newPassword.length < 6) return { success: false, error: 'Şifre en az 6 karakter olmalıdır.' };

  const users = await getUsers();
  const userIndex = users.findIndex((u) => u.email.toLowerCase() === session.email.toLowerCase());
  if (userIndex === -1) return { success: false, error: 'Kullanıcı bulunamadı.' };

  users[userIndex].passwordHash = hashPassword(newPassword);
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
  resetTokens.delete(token);

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

    // Süper admin kontrolü
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
  return users.filter((u) => u.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() || u.role === 'owner' || u.role === 'admin' || u.role === 'moderator');
}

export async function assignAdminRole(email: string, role: 'admin' | 'moderator'): Promise<{ success: boolean; error?: string }> {
  const cleanEmail = email.toLowerCase().trim();
  const users = await getUsers();
  const index = users.findIndex((u) => u.email.toLowerCase() === cleanEmail);

  if (index === -1) {
    return { success: false, error: 'Bu Gmail adresine sahip kayıtlı kullanıcı bulunamadı.' };
  }

  if (users[index].email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
    return { success: false, error: 'Kurucu hesap rolü değiştirilemez.' };
  }

  users[index].role = role;
  if (!users[index].adminSince) {
    users[index].adminSince = new Date().toISOString();
  }

  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
  return { success: true };
}

export async function revokeAdminRole(userId: string): Promise<{ success: boolean; error?: string }> {
  const users = await getUsers();
  const index = users.findIndex((u) => u.id === userId);

  if (index === -1) return { success: false, error: 'Kullanıcı bulunamadı.' };
  if (users[index].email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
    return { success: false, error: 'Kurucu yöneticinin yetkisi alınamaz.' };
  }

  users[index].role = 'user';
  delete users[index].adminSince;

  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
  return { success: true };
}