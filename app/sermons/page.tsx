import { list } from '@/lib/content-store/store';
import type { Sermon } from '@/lib/content-store/types';
import ContentCard from '@/components/ContentCard';
import Link from 'next/link';

const ITEMS_PER_PAGE = 10;

interface SermonsPageProps {
  searchParams: Promise<{ page?: string; q?: string }>;
}

export default async function SermonsPage({ searchParams }: SermonsPageProps) {
  const { page: pageParam, q } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam || '1', 10) || 1);
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  const { data: sermons, count } = await list('sermons', {
    publishedOnly: true,
    search: q,
    page: currentPage,
    perPage: ITEMS_PER_PAGE,
    orderBy: 'sermon_date',
    orderAsc: false,
  }) as { data: Sermon[]; count: number };

  const totalCount = count;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '3rem 1.5rem 5rem',
      }}
    >
      <h1
        style={{
          fontFamily: 'var(--font-amiri)',
          fontSize: '3rem',
          color: '#C9A84C',
          textAlign: 'center',
          marginBottom: '0.5rem',
          fontWeight: 700,
        }}
      >
        الخطب
      </h1>

      <p
        style={{
          textAlign: 'center',
          color: '#999',
          fontSize: '1.05rem',
          marginBottom: '2.5rem',
          fontFamily: 'var(--font-noto)',
        }}
      >
        استمع وتأمل في الخطب الدينية المختارة
      </p>

      <form
        method='GET'
        action='/sermons'
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '2.5rem',
        }}
      >
        <input
          type='text'
          name='q'
          defaultValue={q || ''}
          placeholder='ابحث في الخطب...'
          dir='rtl'
          style={{
            width: '100%',
            maxWidth: '500px',
            padding: '0.85rem 1.25rem',
            backgroundColor: '#111111',
            border: '1px solid rgba(201, 168, 76, 0.3)',
            borderRadius: '8px',
            color: '#f5f0e8',
            fontSize: '1rem',
            fontFamily: 'var(--font-noto)',
            outline: 'none',
            caretColor: '#C9A84C',
          }}
        />
        <button
          type='submit'
          style={{
            marginRight: '0.5rem',
            padding: '0.85rem 1.5rem',
            backgroundColor: '#C9A84C',
            color: '#0a0a0a',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontFamily: 'var(--font-noto)',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
        >
          بحث
        </button>
      </form>

      {!q && sermons.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            color: '#999',
            padding: '4rem 2rem',
            fontFamily: 'var(--font-noto)',
            fontSize: '1.1rem',
          }}
        >
          لا توجد خطب متاحة حالياً
        </div>
      )}

      {q && sermons.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            color: '#999',
            padding: '4rem 2rem',
            fontFamily: 'var(--font-noto)',
            fontSize: '1.1rem',
          }}
        >
          لا توجد نتائج لـ "{q}"
        </div>
      )}

      {sermons.length > 0 && (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.5rem',
              marginBottom: '3rem',
            }}
          >
            {sermons.map((sermon) => (
              <ContentCard
                key={sermon.id}
                title={sermon.title}
                description={sermon.description || undefined}
                date={sermon.sermon_date ? formatDate(sermon.sermon_date) : undefined}
                type='خطبة'
                href={`/sermons/${sermon.id}`}
                audioUrl={sermon.audio_url || undefined}
                thumbnailUrl={sermon.thumbnail_url || undefined}
                duration={sermon.duration ?? undefined}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0.5rem',
                flexWrap: 'wrap',
              }}
            >
              {currentPage > 1 && (
                <Link
                  href={`/sermons?page=${currentPage - 1}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
                  style={{
                    padding: '0.6rem 1.2rem',
                    backgroundColor: '#111111',
                    color: '#C9A84C',
                    border: '1px solid rgba(201, 168, 76, 0.3)',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontFamily: 'var(--font-noto)',
                    fontSize: '0.95rem',
                    transition: 'all 0.2s',
                  }}
                >
                  السابق
                </Link>
              )}

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  if (totalPages <= 7) return true;
                  if (p === 1 || p === totalPages) return true;
                  if (Math.abs(p - currentPage) <= 2) return true;
                  return false;
                })
                .map((p, idx, arr) => {
                  const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                  return (
                    <span key={p} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {showEllipsis && (
                        <span style={{ color: '#666', fontFamily: 'var(--font-noto)' }}>...</span>
                      )}
                      {p === currentPage ? (
                        <span
                          style={{
                            padding: '0.6rem 1rem',
                            backgroundColor: '#C9A84C',
                            color: '#0a0a0a',
                            borderRadius: '6px',
                            fontFamily: 'var(--font-noto)',
                            fontSize: '0.95rem',
                            fontWeight: 600,
                          }}
                        >
                          {p}
                        </span>
                      ) : (
                        <Link
                          href={`/sermons?page=${p}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
                          style={{
                            padding: '0.6rem 1rem',
                            backgroundColor: '#111111',
                            color: '#f5f0e8',
                            border: '1px solid rgba(201, 168, 76, 0.2)',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            fontFamily: 'var(--font-noto)',
                            fontSize: '0.95rem',
                            transition: 'all 0.2s',
                          }}
                        >
                          {p}
                        </Link>
                      )}
                    </span>
                  );
                })}

              {currentPage < totalPages && (
                <Link
                  href={`/sermons?page=${currentPage + 1}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
                  style={{
                    padding: '0.6rem 1.2rem',
                    backgroundColor: '#111111',
                    color: '#C9A84C',
                    border: '1px solid rgba(201, 168, 76, 0.3)',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontFamily: 'var(--font-noto)',
                    fontSize: '0.95rem',
                    transition: 'all 0.2s',
                  }}
                >
                  التالي
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}