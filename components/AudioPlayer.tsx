'use client'

import { useRef, useState, useEffect } from "react";

interface AudioPlayerProps {
  src: string;
  title?: string;
}

export default function AudioPlayer({ src, title }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration);
    const onEnded = () => setIsPlaying(false);
    const onLoadedMetadata = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const skip = (seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(
      0,
      Math.min(audioRef.current.currentTime + seconds, audioRef.current.duration || 0)
    );
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !audioRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    audioRef.current.currentTime = percent * duration;
  };

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div
      style={{
        backgroundColor: "#111111",
        border: "1px solid rgba(201, 168, 76, 0.3)",
        borderRadius: "8px",
        padding: "1.25rem",
      }}
    >
      <audio ref={audioRef} src={src} preload="metadata" />

      {title && (
        <div
          style={{
            fontFamily: "var(--font-amiri)",
            fontSize: "1rem",
            color: "#f5f0e8",
            marginBottom: "1rem",
            textAlign: "center",
          }}
        >
          {title}
        </div>
      )}

      <div
        ref={progressRef}
        onClick={handleProgressClick}
        style={{
          width: "100%",
          height: "6px",
          backgroundColor: "#222",
          borderRadius: "3px",
          cursor: "pointer",
          marginBottom: "1rem",
          position: "relative",
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            backgroundColor: "#C9A84C",
            borderRadius: "3px",
            transition: "width 0.1s linear",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <button
            onClick={() => skip(-30)}
            style={{
              background: "none",
              border: "1px solid rgba(201, 168, 76, 0.3)",
              color: "#C9A84C",
              padding: "0.4rem 0.6rem",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "0.8rem",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#C9A84C";
              e.currentTarget.style.backgroundColor = "rgba(201, 168, 76, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(201, 168, 76, 0.3)";
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            -30
          </button>

          <button
            onClick={togglePlay}
            style={{
              background: "#C9A84C",
              border: "none",
              color: "#0a0a0a",
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              cursor: "pointer",
              fontSize: "1.2rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#D4B85A";
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#C9A84C";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            {isPlaying ? "⏸" : "▶"}
          </button>

          <button
            onClick={() => skip(30)}
            style={{
              background: "none",
              border: "1px solid rgba(201, 168, 76, 0.3)",
              color: "#C9A84C",
              padding: "0.4rem 0.6rem",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "0.8rem",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#C9A84C";
              e.currentTarget.style.backgroundColor = "rgba(201, 168, 76, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(201, 168, 76, 0.3)";
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            +30
          </button>
        </div>

        <div
          style={{
            color: "#888",
            fontSize: "0.85rem",
            fontFamily: "monospace",
          }}
        >
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>
    </div>
  );
}
