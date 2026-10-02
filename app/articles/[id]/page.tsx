import { list, getById } from '@/lib/content-store/store';
import type { Article } from '@/lib/content-store/types';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let article: Article | null = null;
  try {
    article = await getById('articles', id, { publishedOnly: true });
    if (!article) {
      notFound();
    }
  } catch {
    notFound();
  }

  const { data: relatedArticles } = await list('articles', {
    publishedOnly: true,
    excludeId: id,
    limit: 3,
    orderBy: 'created_at',
    orderAsc: false,
  }) as { data: Article[]; count: number };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 1rem' }}>
      <Link
        href='/articles'
        style={{
          color: '#C9A84C',
          textDecoration: 'none',
          fontFamily: 'var(--font-noto)',
          fontSize: '0.95rem',
          display: 'inline-block',
          marginBottom: '2rem',
          transition: 'opacity 0.2s',
        }}
        className='back-link'
      >
        ← العودة إلى المقالات
      </Link>

      <article>
        {article.cover_url && (
          <img
            src={article.cover_url}
            alt={article.title}
            style={{
              width: '100%',
              maxHeight: '400px',
              objectFit: 'cover',
              borderRadius: '12px',
              marginBottom: '2rem',
              border: '1px solid rgba(201, 168, 76, 0.2)',
            }}
          />
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              color: '#999',
              fontFamily: 'var(--font-noto)',
              fontSize: '0.85rem',
            }}
          >
            {new Date(article.created_at).toLocaleDateString('ar-SA', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
          {article.tags && article.tags.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {article.tags.map((tag: string) => (
                <span
                  key={tag}
                  style={{
                    backgroundColor: 'rgba(201, 168, 76, 0.1)',
                    color: '#C9A84C',
                    fontFamily: 'var(--font-noto)',
                    fontSize: '0.8rem',
                    padding: '3px 12px',
                    borderRadius: '20px',
                    border: '1px solid rgba(201, 168, 76, 0.25)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-amiri)',
            fontSize: '2.5rem',
            fontWeight: 700,
            color: '#C9A84C',
            margin: '0 0 2rem',
            lineHeight: 1.3,
          }}
        >
          {article.title}
        </h1>

        <div
          style={{
            fontFamily: 'var(--font-noto)',
            fontSize: '1.05rem',
            color: '#f5f0e8',
            lineHeight: 2,
            maxWidth: '100%',
          }}
          className='article-content'
        >
          {article.content.split('\n').map((paragraph: string, i: number) => (
            <p key={i} style={{ margin: '0 0 1.25rem' }}>
              {paragraph}
            </p>
          ))}
        </div>
      </article>

      {relatedArticles && relatedArticles.length > 0 && (
        <section
          style={{
            marginTop: '4rem',
            paddingTop: '2.5rem',
            borderTop: '1px solid rgba(201, 168, 76, 0.2)',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-amiri)',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#C9A84C',
              margin: '0 0 1.5rem',
            }}
          >
            مقالات ذات صلة
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
              gap: '1rem',
            }}
          >
            {relatedArticles.map((related) => (
              <Link
                key={related.id}
                href={`/articles/${related.id}`}
                style={{ textDecoration: 'none' }}
                className='related-card'
              >
                <div
                  style={{
                    backgroundColor: '#111111',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    border: '1px solid rgba(201, 168, 76, 0.15)',
                    transition: 'transform 0.3s ease, border-color 0.3s ease',
                  }}
                >
                  {related.cover_url && (
                    <img
                      src={related.cover_url}
                      alt={related.title}
                      style={{
                        width: '100%',
                        height: '150px',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  )}
                  <div style={{ padding: '0.75rem' }}>
                    <h3
                      style={{
                        fontFamily: 'var(--font-amiri)',
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: '#f5f0e8',
                        margin: '0 0 0.25rem',
                        lineHeight: 1.4,
                      }}
                    >
                      {related.title}
                    </h3>
                    {related.excerpt && (
                      <p
                        style={{
                          fontFamily: 'var(--font-noto)',
                          fontSize: '0.8rem',
                          color: '#999',
                          margin: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {related.excerpt}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <style>{`
        .back-link:hover {
          opacity: 0.7;
        }
        .related-card:hover > div {
          transform: translateY(-2px);
          border-color: rgba(201, 168, 76, 0.4) !important;
        }
        .article-content p:first-child {
          margin-top: 0;
        }
      `}</style>
    </div>
  );
}