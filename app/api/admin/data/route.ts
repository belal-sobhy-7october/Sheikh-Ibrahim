import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { list, create, VALID_TABLES, type TableName } from '@/lib/content-store/store';
import { revalidatePath } from 'next/cache';

function assertTable(table: string): asserts table is TableName {
  if (!VALID_TABLES.includes(table as TableName)) {
    throw new Error('Invalid table');
  }
}

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get(AUTH_COOKIE_NAME);
  const result = session?.value ? verifySessionToken(session.value) : { valid: false };

  if (!result.valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const table = searchParams.get('table');

  if (!table) {
    return NextResponse.json({ error: 'Invalid table' }, { status: 400 });
  }
  assertTable(table);

  const { data } = await list(table, { publishedOnly: false });

  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get(AUTH_COOKIE_NAME);
  const result = session?.value ? verifySessionToken(session.value) : { valid: false };

  if (!result.valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { table, ...fields } = body;

  if (!table) {
    return NextResponse.json({ error: 'Invalid table' }, { status: 400 });
  }
  assertTable(table);

  // Handle tags for articles
  if (table === 'articles' && typeof fields.tags === 'string') {
    fields.tags = fields.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
  }

  // Handle media_url for lectures/sermons
  if ((table === 'lectures' || table === 'sermons') && fields.media_url) {
    const url = fields.media_url as string;
    if (/(?:youtube\.com|youtu\.be)/.test(url)) {
      fields.youtube_url = url;
      fields.audio_url = null;
    } else {
      fields.audio_url = url;
      fields.youtube_url = null;
    }
    delete fields.media_url;
  }

  // Remove fields not applicable to specific tables
  if (table === 'lectures') {
    delete fields.duration;
  }
  if (table === 'sermons') {
    delete fields.sermon_date;
    delete fields.location;
  }

  try {
    const newItem = await create(table, fields);

    // Revalidate affected public paths
    revalidateAllPaths();

    return NextResponse.json({ data: newItem });
  } catch (err) {
    if (err instanceof Error && err.message === 'WRITE_DISABLED: edits must be made locally and pushed') {
      return NextResponse.json(
        { error: 'التعديل غير متاح في بيئة الإنتاج. يرجى التعديل محلياً ثم النشر.' },
        { status: 403 }
      );
    }
    return NextResponse.json({ error: err instanceof Error ? err.message : 'حدث خطأ' }, { status: 500 });
  }
}

function getRevalidationPaths(table: TableName): string[] {
  const basePaths = ['/', '/articles', '/books', '/lectures', '/sermons'];
  const detailPaths = ['/articles/[id]', '/books/[id]', '/lectures/[id]', '/sermons/[id]'];
  // Revalidate layout pages too
  const layoutPaths = ['/articles', '/books', '/lectures', '/sermons'];
  return [...basePaths, ...detailPaths, ...layoutPaths];
}

function revalidateAllPaths() {
  const paths = [
    '/',
    '/articles', '/articles/[id]',
    '/books', '/books/[id]',
    '/lectures', '/lectures/[id]',
    '/sermons', '/sermons/[id]',
  ];
  for (const path of paths) {
    const type = path.includes('[id]') ? 'page' : undefined;
    revalidatePath(path, type);
  }
}