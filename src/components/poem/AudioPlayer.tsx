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
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-full border border-border-light bg-cream/50 backdrop-blur-sm max-w-xs mx-auto">
      <audio ref={audioRef} src={`/api/public/poems/${slug}/audio`} preload="none" />

      <button
        onClick={toggle}
        className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-sepia/10 hover:bg-sepia/20 text-sepia transition-colors"
        aria-label={playing ? "Pause" : "Listen to poem"}
      >
        {playing ? <PauseIcon /> : <PlayIcon />}
      </button>

      <div className="flex-1 flex items-center gap-2 min-w-0">
        <div
          className="flex-1 h-1 bg-border-light rounded-full cursor-pointer relative"
          onClick={seek}
        >
          <div
            className="absolute inset-y-0 left-0 bg-sepia/60 rounded-full transition-[width] duration-200"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        {duration > 0 && (
          <span className="text-xs text-charcoal-light/50 font-[family-name:var(--font-ui)] tabular-nums flex-shrink-0">
            {formatTime(duration)}
          </span>
        )}
      </div>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 3.5L20 12L6 20.5V3.5Z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="3" width="5" height="18" rx="1" />
      <rect x="14" y="3" width="5" height="18" rx="1" />
    </svg>
  );
}
