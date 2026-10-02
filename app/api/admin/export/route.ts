import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { getAllData } from '@/lib/content-store/store';

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get(AUTH_COOKIE_NAME);
  const result = session?.value ? verifySessionToken(session.value) : { valid: false };

  if (!result.valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await getAllData();

  const headers = new Headers();
  headers.set('Content-Disposition', `attachment; filename="backup-${new Date().toISOString().split('T')[0]}.json"`);
  headers.set('Content-Type', 'application/json');

  return new NextResponse(JSON.stringify(data, null, 2), { headers });
}