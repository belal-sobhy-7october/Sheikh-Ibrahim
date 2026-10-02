import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyPassword, createSessionToken, checkRateLimit, recordFailedAttempt, clearFailedAttempts, getClientIp, getCookieOptions, AUTH_COOKIE_NAME } from '@/lib/auth';

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(ip);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, error: 'محاولات كثيرة، يرجى المحاولة بعد دقيقة' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter || 60) } }
    );
  }

  const { password } = await request.json();

  if (verifyPassword(password)) {
    clearFailedAttempts(ip);
    const cookieStore = await cookies();
    const token = createSessionToken();
    cookieStore.set(AUTH_COOKIE_NAME, token, getCookieOptions());
    return NextResponse.json({ success: true });
  }

  recordFailedAttempt(ip);
  return NextResponse.json(
    { success: false, error: 'كلمة المرور غير صحيحة' },
    { status: 401 }
  );
}