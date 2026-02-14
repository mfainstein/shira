"use client";

import { useRef, useState, useEffect, useCallback } from "react";

interface AudioPlayerProps {
  slug: string;
}

export function AudioPlayer({ slug }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [entered, setEntered] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 300);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      if (!dragging && audio.duration) {
        setProgress(audio.currentTime / audio.duration);
        setCurrentTime(audio.currentTime);
      }
    };
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => {
      setPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, [dragging]);

  const seekTo = useCallback((clientX: number) => {
    const audio = audioRef.current;
    const track = trackRef.current;
    if (!audio || !track || !audio.duration) return;
    const rect = track.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setProgress(pct);
    setCurrentTime(pct * audio.duration);
    audio.currentTime = pct * audio.duration;
  }, []);

  // Mouse drag
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);
    seekTo(e.clientX);

    const onMove = (ev: MouseEvent) => seekTo(ev.clientX);
    const onUp = () => {
      setDragging(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [seekTo]);

  // Touch drag
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setDragging(true);
    seekTo(e.touches[0].clientX);

    const onMove = (ev: TouchEvent) => {
      ev.preventDefault();
      seekTo(ev.touches[0].clientX);
    };
    const onEnd = () => {
      setDragging(false);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);
  }, [seekTo]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
    setPlaying(!playing);
    if (!expanded) setExpanded(true);
  };

  const skip = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    audio.currentTime = Math.max(0, Math.min(audio.duration, audio.currentTime + seconds));
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className="flex flex-col items-center transition-all duration-1000 ease-out"
      style={{
        opacity: entered ? 1 : 0,
        transform: entered ? "translateY(0)" : "translateY(8px)",
      }}
    >
      <audio ref={audioRef} src={`/api/public/poems/${slug}/audio`} preload="none" />

      <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-border-light/60 bg-ivory-dark/40">
        {/* Skip back — only when expanded */}
        {expanded && (
          <button
            onClick={() => skip(-15)}
            className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-charcoal-light/40 hover:text-sepia transition-colors"
            aria-label="Back 15 seconds"
          >
            <Skip15BackIcon />
          </button>
        )}

        {/* Play / Pause */}
        <button
          onClick={toggle}
          className="audio-btn flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-sepia transition-colors hover:bg-sepia/10"
          aria-label={playing ? "Pause" : "Listen to poem"}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>

        {/* Skip forward — only when expanded */}
        {expanded && (
          <button
            onClick={() => skip(15)}
            className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-charcoal-light/40 hover:text-sepia transition-colors"
            aria-label="Forward 15 seconds"
          >
            <Skip15ForwardIcon />
          </button>
        )}

        {expanded ? (
          <div className="flex items-center gap-2 min-w-0">
            {/* Time elapsed */}
            <span className="text-[10px] text-charcoal-light/40 font-[family-name:var(--font-ui)] tabular-nums w-7 text-right flex-shrink-0">
              {fmt(currentTime)}
            </span>

            {/* Draggable seek track */}
            <div
              ref={trackRef}
              className="w-24 sm:w-36 h-3 flex items-center cursor-pointer touch-none group"
              onMouseDown={onMouseDown}
              onTouchStart={onTouchStart}
            >
              <div className="w-full h-[3px] bg-border-light rounded-full relative">
                <div
                  className="absolute inset-y-0 left-0 bg-sepia/50 rounded-full"
                  style={{ width: `${progress * 100}%` }}
                />
                {/* Thumb */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-sepia/70 shadow-sm transition-transform group-hover:scale-125"
                  style={{ left: `${progress * 100}%` }}
                />
              </div>
            </div>

            {/* Duration */}
            <span className="text-[10px] text-charcoal-light/40 font-[family-name:var(--font-ui)] tabular-nums w-7 flex-shrink-0">
              {duration > 0 ? fmt(duration) : ""}
            </span>
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
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 3.5L20 12L6 20.5V3.5Z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <rect x="5" y="3" width="5" height="18" rx="1" />
      <rect x="14" y="3" width="5" height="18" rx="1" />
    </svg>
  );
}

function Skip15BackIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a9 9 0 1 1-9 9" />
      <polyline points="3 5 3 12 7 12" />
      <text x="8" y="14.5" fontSize="7" fill="currentColor" stroke="none" fontFamily="sans-serif" fontWeight="600">15</text>
    </svg>
  );
}

function Skip15ForwardIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a9 9 0 1 0 9 9" />
      <polyline points="21 5 21 12 17 12" />
      <text x="8" y="14.5" fontSize="7" fill="currentColor" stroke="none" fontFamily="sans-serif" fontWeight="600">15</text>
    </svg>
  );
}
