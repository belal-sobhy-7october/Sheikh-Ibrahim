"use client";

import Link from "next/link";

interface ContentCardProps {
  title: string;
  description?: string;
  date?: string;
  type: string;
  href: string;
  audioUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
}

export default function ContentCard({
  title,
  description,
  date,
  type,
  href,
  thumbnailUrl,
  duration,
}: ContentCardProps) {
  const formatDuration = (seconds?: number) => {
    if (!seconds) return "";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")} س`;
    return `${m} د`;
  };

  return (
    <Link
      href={href}
      style={{
        display: "block",
        backgroundColor: "#111111",
        border: "1px solid rgba(201, 168, 76, 0.2)",
        borderRadius: "8px",
        overflow: "hidden",
        textDecoration: "none",
        transition: "all 0.3s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#C9A84C";
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(201, 168, 76, 0.15)";
        e.currentTarget.style.transform = "translateY(-4px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(201, 168, 76, 0.2)";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {thumbnailUrl && (
        <div
          style={{
            width: "100%",
            aspectRatio: "16/9",
            overflow: "hidden",
            backgroundColor: "#1a1a1a",
          }}
        >
          <img
            src={thumbnailUrl}
            alt={title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          />
        </div>
      )}
      <div style={{ padding: "1.25rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "0.5rem",
          }}
        >
          <span
            style={{
              fontSize: "0.75rem",
              color: "#C9A84C",
              backgroundColor: "rgba(201, 168, 76, 0.1)",
              padding: "0.2rem 0.6rem",
              borderRadius: "4px",
              fontWeight: 600,
            }}
          >
            {type}
          </span>
          {duration && (
            <span style={{ fontSize: "0.75rem", color: "#888" }}>
              {formatDuration(duration)}
            </span>
          )}
          {date && (
            <span style={{ fontSize: "0.75rem", color: "#666", marginRight: "auto" }}>
              {date}
            </span>
          )}
        </div>
        <h3
          style={{
            fontFamily: "var(--font-amiri)",
            fontSize: "1.1rem",
            fontWeight: 700,
            color: "#f5f0e8",
            marginBottom: "0.5rem",
            lineHeight: 1.5,
          }}
        >
          {title}
        </h3>
        {description && (
          <p
            style={{
              fontSize: "0.85rem",
              color: "#999",
              lineHeight: 1.7,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {description}
          </p>
        )}
      </div>
    </Link>
  );
}
