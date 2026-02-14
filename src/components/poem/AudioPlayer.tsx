"use client";

import { useRef, useState, useEffect } from "react";

interface AudioPlayerProps {
  slug: string;
}

export function AudioPlayer({ slug }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    // Trigger entrance animation after mount
    const t = setTimeout(() => setEntered(true), 300);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      if (audio.duration) {
        setProgress(audio.currentTime / audio.duration);
      }
    };
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => {
      setPlaying(false);
      setProgress(0);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
    setPlaying(!playing);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * audio.duration;
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className="flex flex-col items-center gap-2 transition-all duration-1000 ease-out"
      style={{
        opacity: entered ? 1 : 0,
        transform: entered ? "translateY(0)" : "translateY(8px)",
      }}
    >
      <audio ref={audioRef} src={`/api/public/poems/${slug}/audio`} preload="none" />

      {/* Compact player row */}
      <div className="flex items-center gap-3 px-4 py-2 rounded-full border border-border-light/60 bg-ivory-dark/40">
        <button
          onClick={toggle}
          className="audio-btn flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-sepia transition-colors hover:bg-sepia/10"
          aria-label={playing ? "Pause" : "Listen to poem"}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>

        {playing || progress > 0 ? (
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-24 sm:w-32 h-0.5 bg-border-light rounded-full cursor-pointer relative"
              onClick={seek}
            >
              <div
                className="absolute inset-y-0 left-0 bg-sepia/50 rounded-full"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            {duration > 0 && (
              <span className="text-[10px] text-charcoal-light/40 font-[family-name:var(--font-ui)] tabular-nums">
                {formatTime(duration)}
              </span>
            )}
          </div>
        ) : (
          <span className="text-xs text-charcoal-light/50 font-[family-name:var(--font-ui)] tracking-wide">
            Listen
          </span>
        )}
      </div>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 3.5L20 12L6 20.5V3.5Z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="3" width="5" height="18" rx="1" />
      <rect x="14" y="3" width="5" height="18" rx="1" />
    </svg>
  );
}
