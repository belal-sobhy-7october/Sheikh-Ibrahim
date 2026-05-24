import { supabase } from "@/lib/supabase";
import HeroSection from "@/components/HeroSection";
import ContentCard from "@/components/ContentCard";
import Link from "next/link";

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

interface SectionItem {
  id: string;
  title: string;
  description?: string | null;
  excerpt?: string | null;
  cover_url?: string | null;
  thumbnail_url?: string | null;
  duration?: number | null;
  category?: string | null;
  created_at: string;
}

interface SectionConfig {
  table: string;
  select: string;
  type: string;
  hrefPrefix: string;
}

async function fetchSection(config: SectionConfig) {
  try {
    const { data, error } = await supabase
      .from(config.table)
      .select(config.select)
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(3);
    if (error) return [];
    return (data ?? []) as unknown as SectionItem[];
  } catch {
    return [];
  }
}

const sectionBg = (index: number) =>
  index % 2 === 0 ? "#0a0a0a" : "#0d0d0d";

const sectionStyle: React.CSSProperties = {
  padding: "4rem 1.5rem",
};

const containerStyle: React.CSSProperties = {
  maxWidth: "1200px",
  margin: "0 auto",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "2.5rem",
};

const titleStyle: React.CSSProperties = {
  fontFamily: "var(--font-amiri)",
  fontSize: "1.75rem",
  fontWeight: 700,
  color: "#C9A84C",
};

const linkStyle: React.CSSProperties = {
  fontFamily: "var(--font-noto)",
  color: "#C9A84C",
  textDecoration: "none",
  fontSize: "0.95rem",
  fontWeight: 600,
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
  gap: "1.5rem",
};

const emptyStyle: React.CSSProperties = {
  textAlign: "center",
  color: "#666",
  fontFamily: "var(--font-noto)",
  fontSize: "1rem",
  padding: "3rem 0",
};

const sections: {
  title: string;
  config: SectionConfig;
  href: string;
  emptyText: string;
}[] = [
  {
    title: "آخر المحاضرات والدروس",
    config: {
      table: "lectures",
      select: "id, title, description, created_at",
      type: "",
      hrefPrefix: "/lectures",
    },
    href: "/lectures",
    emptyText: "لا توجد محاضرات بعد",
  },
  {
    title: "آخر الخطب",
    config: {
      table: "sermons",
      select: "id, title, description, duration, created_at",
      type: "خطبة",
      hrefPrefix: "/sermons",
    },
    href: "/sermons",
    emptyText: "لا توجد خطب بعد",
  },
  {
    title: "آخر المقالات",
    config: {
      table: "articles",
      select: "id, title, excerpt, cover_url, created_at",
      type: "مقال",
      hrefPrefix: "/articles",
    },
    href: "/articles",
    emptyText: "لا توجد مقالات بعد",
  },
  {
    title: "المؤلفات المميزة",
    config: {
      table: "books",
      select: "id, title, description, cover_url, created_at",
      type: "كتاب",
      hrefPrefix: "/books",
    },
    href: "/books",
    emptyText: "لا توجد كتب بعد",
  },
];

function renderSectionCard(
  item: SectionItem,
  sectionTitle: string,
  config: SectionConfig,
) {
  const typeLabel =
    sectionTitle === "آخر المحاضرات والدروس"
      ? "محاضرة"
      : config.type;

  const shared = {
    title: item.title,
    date: formatDate(item.created_at),
    type: typeLabel,
    href: `${config.hrefPrefix}/${item.id}`,
  };

  switch (config.table) {
    case "lectures":
      return (
        <ContentCard
          key={item.id}
          {...shared}
          description={item.description || undefined}
        />
      );
    case "sermons":
      return (
        <ContentCard
          key={item.id}
          {...shared}
          description={item.description || undefined}
          duration={item.duration || undefined}
        />
      );
    case "articles":
      return (
        <ContentCard
          key={item.id}
          {...shared}
          description={item.excerpt || undefined}
          thumbnailUrl={item.cover_url || undefined}
        />
      );
    case "books":
      return (
        <ContentCard
          key={item.id}
          {...shared}
          description={item.description || undefined}
          thumbnailUrl={item.cover_url || undefined}
        />
      );
    default:
      return null;
  }
}

export default async function Home() {
  const results = await Promise.all(
    sections.map((s) => fetchSection(s.config)),
  );

  return (
    <>
      <HeroSection />
      {sections.map((s, i) => {
        const items = results[i];
        return (
          <section
            key={s.title}
            style={{ ...sectionStyle, backgroundColor: sectionBg(i) }}
          >
            <div style={containerStyle}>
              <div style={headerStyle}>
                <h2 style={titleStyle}>{s.title}</h2>
                <Link href={s.href} style={linkStyle}>
                  عرض الكل
                </Link>
              </div>
              {items.length > 0 ? (
                <div style={gridStyle}>
                  {items.map((item) =>
                    renderSectionCard(item, s.title, s.config),
                  )}
                </div>
              ) : (
                <p style={emptyStyle}>{s.emptyText}</p>
              )}
            </div>
          </section>
        );
      })}
    </>
  );
}
