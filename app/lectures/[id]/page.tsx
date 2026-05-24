import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-server";
import AudioPlayer from "@/components/AudioPlayer";
import ContentCard from "@/components/ContentCard";

function getYouTubeEmbedUrl(url: string) {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

export default async function LectureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let lecture: any = null;
  let relatedLectures: any[] = [];

  try {
    const { data, error } = await supabaseAdmin
      .from("lectures")
      .select("*")
      .eq("id", id)
      .eq("published", true)
      .single();

    if (error || !data) {
      notFound();
    }

    lecture = data;

    if (lecture.tags && lecture.tags.length > 0) {
      const { data: related } = await supabaseAdmin
        .from("lectures")
        .select("*")
        .eq("published", true)
        .neq("id", id)
        .overlaps("tags", lecture.tags)
        .order("created_at", { ascending: false })
        .limit(3);

      relatedLectures = related || [];
    }
  } catch (err) {
    console.error("Error fetching lecture:", err);
    notFound();
  }

  const formattedDate = lecture.created_at
    ? new Date(lecture.created_at).toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0a0a0a",
        padding: "2rem 1rem",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        {/* Breadcrumb */}
        <div style={{ marginBottom: "1.5rem" }}>
          <a
            href="/lectures"
            style={{
              color: "#C9A84C",
              fontFamily: "var(--font-noto)",
              fontSize: "0.9rem",
              textDecoration: "none",
              opacity: 0.8,
            }}
          >
            ← العودة إلى المحاضرات
          </a>
        </div>

        {/* Title */}
        <h1
          style={{
            fontFamily: "var(--font-amiri)",
            fontSize: "2rem",
            fontWeight: 700,
            color: "#C9A84C",
            marginBottom: "1.5rem",
            lineHeight: 1.5,
          }}
        >
          {lecture.title}
        </h1>

        {/* Meta */}
        <div
          style={{
            display: "flex",
            gap: "1.5rem",
            marginBottom: "2rem",
            color: "#999",
            fontFamily: "var(--font-noto)",
            fontSize: "0.9rem",
            flexWrap: "wrap",
          }}
        >
          {formattedDate && <span>📅 {formattedDate}</span>}
        </div>

        {/* Media Player */}
        {(() => {
          const mediaUrl = lecture.youtube_url || lecture.audio_url || lecture.media_url || "";
          const isYouTube = /(?:youtube\.com|youtu\.be)/.test(mediaUrl);
          if (mediaUrl && isYouTube) {
            return (
              <div style={{ marginBottom: "2.5rem", position: "relative", width: "100%", paddingTop: "56.25%" }}>
                <iframe
                  src={getYouTubeEmbedUrl(mediaUrl) ?? undefined}
                  title={lecture.title}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    border: "none",
                    borderRadius: "8px",
                  }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            );
          }
          if (mediaUrl) {
            return (
              <div style={{ marginBottom: "2.5rem" }}>
                <AudioPlayer src={mediaUrl} title={lecture.title} />
              </div>
            );
          }
          return (
            <div
              style={{
                backgroundColor: "#111111",
                border: "1px solid rgba(201, 168, 76, 0.2)",
                borderRadius: "8px",
                padding: "2rem",
                textAlign: "center",
                color: "#999",
                fontFamily: "var(--font-noto)",
                fontSize: "1rem",
                marginBottom: "2.5rem",
              }}
            >
              لا يوجد تسجيل
            </div>
          );
        })()}

        {/* Description */}
        {lecture.description && (
          <div
            style={{
              backgroundColor: "#111111",
              border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: "8px",
              padding: "1.5rem",
              marginBottom: "2.5rem",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-amiri)",
                fontSize: "1.3rem",
                color: "#f5f0e8",
                marginBottom: "1rem",
              }}
            >
              الوصف
            </h2>
            <p
              style={{
                fontFamily: "var(--font-noto)",
                fontSize: "1rem",
                color: "#ccc",
                lineHeight: 2,
                whiteSpace: "pre-wrap",
              }}
            >
              {lecture.description}
            </p>
          </div>
        )}

        {/* Tags */}
        {lecture.tags && lecture.tags.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              flexWrap: "wrap",
              marginBottom: "2.5rem",
            }}
          >
            {lecture.tags.map((tag: string) => (
              <span
                key={tag}
                style={{
                  backgroundColor: "rgba(201, 168, 76, 0.08)",
                  color: "#C9A84C",
                  padding: "0.3rem 0.8rem",
                  borderRadius: "20px",
                  fontFamily: "var(--font-noto)",
                  fontSize: "0.8rem",
                  border: "1px solid rgba(201, 168, 76, 0.2)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Related Lectures */}
        {relatedLectures.length > 0 && (
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.08)",
              paddingTop: "2.5rem",
              marginTop: "1rem",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-amiri)",
                fontSize: "1.5rem",
                color: "#C9A84C",
                marginBottom: "1.5rem",
                textAlign: "center",
              }}
            >
              محاضرات ذات صلة
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "1.25rem",
              }}
            >
              {relatedLectures.map((related) => (
                <ContentCard
                  key={related.id}
                  title={related.title}
                  description={related.description}
                  date={
                    related.created_at
                      ? new Date(related.created_at).toLocaleDateString("ar-SA", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : undefined
                  }
                  type="محاضرة"
                  href={`/lectures/${related.id}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
