import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, AUTH_COOKIE_NAME } from '@/lib/auth';

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get(AUTH_COOKIE_NAME);
  const result = session?.value ? verifySessionToken(session.value) : { valid: false };
  return NextResponse.json({ authenticated: result.valid });
}