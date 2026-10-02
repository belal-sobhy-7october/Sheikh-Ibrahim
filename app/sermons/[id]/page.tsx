import { getById, list } from '@/lib/content-store/store';
import type { Sermon } from '@/lib/content-store/types';
import { notFound } from 'next/navigation';
import AudioPlayer from '@/components/AudioPlayer';
import ContentCard from '@/components/ContentCard';

interface SermonDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function SermonDetailPage({ params }: SermonDetailPageProps) {
  const { id } = await params;

  let sermon: Sermon | null = null;
  let relatedSermons: Sermon[] = [];
  let error: string | null = null;

  try {
    sermon = await getById('sermons', id, { publishedOnly: true });
    if (!sermon) {
      notFound();
    }

    const { data: related } = await list('sermons', {
      publishedOnly: true,
      excludeId: id,
      limit: 3,
      orderBy: 'sermon_date',
      orderAsc: false,
    }) as { data: Sermon[]; count: number };

    relatedSermons = related || [];
  } catch (e) {
    if (e instanceof Error && e.message.includes('not found')) {
      notFound();
    }
    error = e instanceof Error ? e.message : 'حدث خطأ أثناء تحميل الخطبة';
  }

  if (error || !sermon) {
    return (
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '6rem 1.5rem',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            backgroundColor: '#111111',
            border: '1px solid rgba(231, 76, 60, 0.3)',
            borderRadius: '8px',
            padding: '2rem',
            color: '#e74c3c',
            fontFamily: 'var(--font-noto)',
            fontSize: '1.1rem',
          }}
        >
          {error}
        </div>
      </div>
    );
  }

  const getYouTubeId = (url: string) => {
    const match = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    return match ? match[1] : null;
  };

  return (
    <div
      style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '3rem 1.5rem 5rem',
      }}
    >
      <h1
        style={{
          fontFamily: 'var(--font-amiri)',
          fontSize: '2.4rem',
          color: '#C9A84C',
          marginBottom: '1rem',
          fontWeight: 700,
          lineHeight: 1.5,
        }}
      >
        {sermon.title}
      </h1>

      {(() => {
        const mediaUrl = sermon.youtube_url || sermon.media_url || sermon.video_url || sermon.audio_url || '';
        const isYouTube = /(?:youtube\.com|youtu\.be)/.test(mediaUrl);
        if (mediaUrl && isYouTube) {
          return (
            <div
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '16 / 9',
                borderRadius: '12px',
                overflow: 'hidden',
                marginBottom: '2rem',
                backgroundColor: '#111111',
                border: '1px solid rgba(201, 168, 76, 0.2)',
              }}
            >
              <iframe
                src={`https://www.youtube.com/embed/${getYouTubeId(mediaUrl)}`}
                title={sermon.title}
                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                allowFullScreen
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none',
                }}
              />
            </div>
          );
        }
        if (mediaUrl) {
          return (
            <div style={{ marginBottom: '2rem' }}>
              <AudioPlayer src={mediaUrl} title={sermon.title} />
            </div>
          );
        }
        return null;
      })()}

      {sermon.description && (
        <div
          style={{
            backgroundColor: '#111111',
            border: '1px solid rgba(201, 168, 76, 0.2)',
            borderRadius: '8px',
            padding: '1.5rem 2rem',
            marginBottom: '3rem',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-amiri)',
              fontSize: '1.4rem',
              color: '#C9A84C',
              marginBottom: '1rem',
              fontWeight: 700,
            }}
          >
            عن الخطبة
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-noto)',
              fontSize: '1.05rem',
              color: '#f5f0e8',
              lineHeight: 2,
              whiteSpace: 'pre-wrap',
            }}
          >
            {sermon.description}
          </p>
        </div>
      )}

      {relatedSermons.length > 0 && (
        <div>
          <h2
            style={{
              fontFamily: 'var(--font-amiri)',
              fontSize: '1.6rem',
              color: '#C9A84C',
              marginBottom: '1.5rem',
              fontWeight: 700,
            }}
          >
            خطب ذات صلة
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {relatedSermons.map((related) => (
              <ContentCard
                key={related.id}
                title={related.title}
                description={related.description || undefined}
                type='خطبة'
                href={`/sermons/${related.id}`}
                thumbnailUrl={related.thumbnail_url || undefined}
                duration={related.duration ?? undefined}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}