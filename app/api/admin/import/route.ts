import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { importData, VALID_TABLES } from '@/lib/content-store/store';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get(AUTH_COOKIE_NAME);
  const result = session?.value ? verifySessionToken(session.value) : { valid: false };

  if (!result.valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { data, mode = 'merge' } = body;

    if (!data || typeof data !== 'object') {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    // Validate structure
    for (const table of VALID_TABLES) {
      if (data[table] && !Array.isArray(data[table])) {
        return NextResponse.json({ error: `Invalid data for ${table}: must be an array` }, { status: 400 });
      }
    }

    if (mode !== 'merge' && mode !== 'replace') {
      return NextResponse.json({ error: 'Invalid mode: must be merge or replace' }, { status: 400 });
    }

    await importData(data, mode);

    // Revalidate all public paths
    const allPaths = ['/', '/articles', '/books', '/lectures', '/sermons', '/articles/[id]', '/books/[id]', '/lectures/[id]', '/sermons/[id]'];
    for (const path of allPaths) {
      revalidatePath(path);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof Error && err.message === 'WRITE_DISABLED: edits must be made locally and pushed') {
      return NextResponse.json(
        { error: 'الاستيراد غير متاح في بيئة الإنتاج. يرجى الاستيراد محلياً ثم النشر.' },
        { status: 403 }
      );
    }
    return NextResponse.json({ error: err instanceof Error ? err.message : 'حدث خطأ أثناء الاستيراد' }, { status: 500 });
  }
}