'use server';

import { createPasswordResetRequest, findUserByEmail, hashPassword, initiateRegistration, resetPasswordWithToken, verifyAndCreateUser } from 'lib/auth';
import { revalidatePath } from 'next/cache';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

export async function registerAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const fullName = formData.get('fullName') as string;
  const username = formData.get('username') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const refCode = formData.get('refCode') as string;

  if (!fullName || !username || !email || !password) {
    return { success: false, error: 'Lütfen zorunlu alanları doldurun.' };
  }

  return await initiateRegistration({
    fullName,
    username,
    email,
    password,
    refCode
  });
}

export async function verifyCodeAction(email: string, code: string): Promise<{ success: boolean; error?: string }> {
  const result = await verifyAndCreateUser(email, code);

  if (!result.success) {
    return { success: false, error: result.error };
  }

  const sessionData = Buffer.from(JSON.stringify({ email: email.toLowerCase().trim() })).toString('base64');
  const cookieStore = await cookies();
  cookieStore.set('user_session', sessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/'
  });

  revalidatePath('/');
  return { success: true };
}

export async function loginAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const email = (formData.get('email') as string || '').trim().toLowerCase();
  const password = formData.get('password') as string || '';

  if (!email || !password) {
    return { success: false, error: 'Lütfen tüm alanları doldurunuz.' };
  }

  const user = await findUserByEmail(email);

  if (!user || user.passwordHash !== hashPassword(password)) {
    return { success: false, error: 'E-posta veya şifre hatalı. Lütfen tekrar deneyiniz.' };
  }

  const sessionData = Buffer.from(JSON.stringify({ email: user.email, username: user.username })).toString('base64');
  const cookieStore = await cookies();
  cookieStore.set('user_session', sessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/'
  });

  revalidatePath('/');
  return { success: true };
}

export async function forgotPasswordAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const email = (formData.get('email') as string || '').trim();
  if (!email) {
    return { success: false, error: 'Lütfen e-posta adresinizi giriniz.' };
  }

  const headerList = await headers();
  const host = headerList.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const origin = `${protocol}://${host}`;

  return await createPasswordResetRequest(email, origin);
}

export async function resetPasswordAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const token = formData.get('token') as string;
  const newPassword = formData.get('newPassword') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!token) {
    return { success: false, error: 'Geçersiz doğrulama anahtarı.' };
  }

  if (newPassword !== confirmPassword) {
    return { success: false, error: 'Şifreler birbiriyle uyuşmuyor!' };
  }

  return await resetPasswordWithToken(token, newPassword);
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('user_session');
  revalidatePath('/');
  redirect('/');
}