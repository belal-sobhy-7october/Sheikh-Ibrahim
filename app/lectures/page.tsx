import { list } from '@/lib/content-store/store';
import type { Lecture } from '@/lib/content-store/types';
import ContentCard from '@/components/ContentCard';
import Link from 'next/link';

const ITEMS_PER_PAGE = 10;

export default async function LecturesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { page = '1', q = '' } = await searchParams;
  const currentPage = Math.max(1, parseInt(page as string, 10) || 1);
  const searchQuery = (q as string).trim();

  const from = (currentPage - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  const { data: lectures, count } = await list('lectures', {
    publishedOnly: true,
    search: searchQuery,
    page: currentPage,
    perPage: ITEMS_PER_PAGE,
    orderBy: 'created_at',
    orderAsc: false,
  }) as { data: Lecture[]; count: number };

  const totalCount = count;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const buildHref = (p: number, sq: string) => {
    const params = new URLSearchParams();
    if (p > 1) params.set('page', String(p));
    if (sq) params.set('q', sq);
    const qs = params.toString();
    return `/lectures${qs ? `?${qs}` : ''}`;
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0a',
        padding: '2rem 1rem',
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1
            style={{
              fontFamily: 'var(--font-amiri)',
              fontSize: '2.5rem',
              fontWeight: 700,
              color: '#C9A84C',
              marginBottom: '0.5rem',
            }}
          >
            المحاضرات والدروس
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-noto)',
              fontSize: '1rem',
              color: '#999',
            }}
          >
            دروس ومحاضرات شرعية للشيخ إبراهيم صبحي
          </p>
        </div>

        {/* Search */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '2rem',
          }}
        >
          <form method='GET' action='/lectures' style={{ width: '100%', maxWidth: '480px' }}>
            <input
              type='text'
              name='q'
              defaultValue={searchQuery}
              placeholder='البحث في المحاضرات...'
              style={{
                width: '100%',
                padding: '0.85rem 1.25rem',
                borderRadius: '8px',
                border: '1px solid rgba(201, 168, 76, 0.3)',
                backgroundColor: '#111111',
                color: '#f5f0e8',
                fontFamily: 'var(--font-noto)',
                fontSize: '1rem',
                direction: 'rtl',
                textAlign: 'right',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </form>
        </div>

        {/* Grid */}
        {lectures.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 1rem',
              color: '#999',
              fontFamily: 'var(--font-noto)',
              fontSize: '1.1rem',
            }}
          >
            لا توجد محاضرات أو دروس حالياً
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {lectures.map((lecture) => (
              <ContentCard
                key={lecture.id}
                title={lecture.title}
                description={lecture.description || undefined}
                date={
                  lecture.created_at
                    ? new Date(lecture.created_at).toLocaleDateString('ar-SA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : undefined
                }
                type='محاضرة'
                href={`/lectures/${lecture.id}`}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '3rem',
              flexWrap: 'wrap',
            }}
          >
            {/* Prev */}
            {currentPage > 1 ? (
              <Link
                href={buildHref(currentPage - 1, searchQuery)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(201, 168, 76, 0.3)',
                  color: '#C9A84C',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-noto)',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s',
                }}
              >
                السابق
              </Link>
            ) : (
              <span
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#555',
                  fontFamily: 'var(--font-noto)',
                  fontSize: '0.9rem',
                  cursor: 'not-allowed',
                }}
              >
                السابق
              </span>
            )}

            {/* Page Numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
              const isCurrent = p === currentPage;
              return (
                <Link
                  key={p}
                  href={buildHref(p, searchQuery)}
                  style={{
                    padding: '0.5rem 0.85rem',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontFamily: 'var(--font-noto)',
                    fontSize: '0.9rem',
                    fontWeight: isCurrent ? 700 : 400,
                    backgroundColor: isCurrent ? '#C9A84C' : 'transparent',
                    color: isCurrent ? '#0a0a0a' : '#f5f0e8',
                    border: isCurrent
                      ? '1px solid #C9A84C'
                      : '1px solid rgba(255,255,255,0.1)',
                    transition: 'all 0.2s',
                  }}
                >
                  {p}
                </Link>
              );
            })}

            {/* Next */}
            {currentPage < totalPages ? (
              <Link
                href={buildHref(currentPage + 1, searchQuery)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(201, 168, 76, 0.3)',
                  color: '#C9A84C',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-noto)',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s',
                }}
              >
                التالي
              </Link>
            ) : (
              <span
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#555',
                  fontFamily: 'var(--font-noto)',
                  fontSize: '0.9rem',
                  cursor: 'not-allowed',
                }}
              >
                التالي
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}