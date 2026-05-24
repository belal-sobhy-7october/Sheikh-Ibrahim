"use client";

import { useState } from "react";

export default function ArticleImage({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(201, 168, 76, 0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "150px",
        }}
      >
        <span style={{ fontSize: "2rem", color: "#C9A84C", opacity: 0.5 }}>
          📝
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
      }}
    />
  );
}
