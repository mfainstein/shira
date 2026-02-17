"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { normalizeWord } from "@/lib/vocabulary-utils";
import { LineExplanation } from "./LineExplanation";

interface VocabularyTextProps {
  text: string;
  vocabulary: Record<string, string>;
  isHebrew: boolean;
  lineExplanations?: Record<string, string> | null;
  openLines?: Set<string>;
  onToggleLine?: (line: string) => void;
}

function ExplainIcon({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`inline-flex items-center justify-center w-4 h-4 rounded-full transition-colors align-middle mx-1 ${
        isOpen
          ? "text-sepia"
          : "text-charcoal-light/25 hover:text-sepia/60"
      }`}
      aria-label="Explain this line"
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18h6" />
        <path d="M10 22h4" />
        <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
      </svg>
    </button>
  );
}

export function VocabularyText({
  text,
  vocabulary,
  isHebrew,
  lineExplanations,
  openLines,
  onToggleLine,
}: VocabularyTextProps) {
  const [activeWord, setActiveWord] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const activeElRef = useRef<HTMLElement | null>(null);

  const handleWordClick = useCallback(
    (word: string, event: React.MouseEvent) => {
      const key = normalizeWord(word);
      if (vocabulary[key]) {
        if (activeWord === key) {
          setActiveWord(null);
          setTooltipPos(null);
          activeElRef.current = null;
        } else {
          setActiveWord(key);
          const el = event.target as HTMLElement;
          activeElRef.current = el;
          const rect = el.getBoundingClientRect();
          setTooltipPos({
            x: rect.left + rect.width / 2,
            y: rect.top,
          });
        }
      }
    },
    [vocabulary, activeWord]
  );

  const dismiss = useCallback(() => {
    setActiveWord(null);
    setTooltipPos(null);
    activeElRef.current = null;
  }, []);

  // Reposition tooltip on scroll so it stays anchored to the word
  useEffect(() => {
    if (!activeWord || !activeElRef.current) return;

    const update = () => {
      const el = activeElRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top });
    };

    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [activeWord]);

  const getExplanation = (line: string): string | undefined => {
    if (!lineExplanations) return undefined;
    return lineExplanations[line] || lineExplanations[line.trim()];
  };

  const lines = text.split("\n");
  let firstLineRendered = false;

  return (
    <div className="relative" onClick={(e) => {
      if ((e.target as HTMLElement).dataset.vocabWord === undefined) {
        dismiss();
      }
    }}>
      {lines.map((line, lineIdx) => {
        if (line.trim() === "") {
          return <div key={lineIdx} className="h-4" />;
        }

        const isFirstLine = !firstLineRendered;
        if (isFirstLine) firstLineRendered = true;

        const words = line.split(/(\s+)/);
        const explanation = getExplanation(line);

        return (
          <div key={lineIdx}>
            <p className={`leading-relaxed ${isFirstLine ? "drop-cap" : ""}`}>
              {words.map((segment, wordIdx) => {
                if (/^\s+$/.test(segment)) {
                  return <span key={wordIdx}>{segment}</span>;
                }

                const cleanWord = normalizeWord(segment);
                const hasDefinition = !!vocabulary[cleanWord];

                if (hasDefinition) {
                  const isActive = activeWord === cleanWord;
                  return (
                    <span
                      key={wordIdx}
                      data-vocab-word=""
                      onClick={(e) => {
                        e.stopPropagation();
                        handleWordClick(segment, e);
                      }}
                      className={`cursor-pointer transition-colors border-b border-dotted ${
                        isActive
                          ? "border-sepia text-sepia"
                          : "border-charcoal-light/30 hover:border-sepia/50 hover:text-sepia/80"
                      }`}
                    >
                      {segment}
                    </span>
                  );
                }

                return <span key={wordIdx}>{segment}</span>;
              })}
              {explanation && onToggleLine && (
                <ExplainIcon
                  isOpen={openLines?.has(line.trim()) ?? false}
                  onClick={() => onToggleLine(line.trim())}
                />
              )}
            </p>
            {explanation && (
              <LineExplanation
                explanation={explanation}
                isOpen={openLines?.has(line.trim()) ?? false}
                isHebrew={isHebrew}
              />
            )}
          </div>
        );
      })}

      {/* Tooltip */}
      {activeWord && tooltipPos && vocabulary[activeWord] && (() => {
        // Clamp horizontal position so tooltip stays on screen
        const pad = 12;
        const tooltipWidth = 256; // max-w-xs = 20rem = ~320px, but content is usually smaller
        const halfWidth = tooltipWidth / 2;
        const vw = typeof window !== "undefined" ? window.innerWidth : 400;
        const clampedX = Math.max(halfWidth + pad, Math.min(tooltipPos.x, vw - halfWidth - pad));

        return (
          <div
            className="fixed z-50 max-w-xs px-4 py-3 bg-charcoal text-white text-sm rounded-lg shadow-lg"
            style={{
              left: `${clampedX}px`,
              top: `${tooltipPos.y - 8}px`,
              transform: "translate(-50%, -100%)",
            }}
            dir="ltr"
          >
            <p className={`font-medium mb-1 ${isHebrew ? "font-[family-name:var(--font-hebrew)]" : ""}`}>
              {activeWord}
            </p>
            <p className="text-white/80 text-xs leading-relaxed">
              {vocabulary[activeWord]}
            </p>
            <div
              className="absolute top-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-charcoal"
              style={{
                left: `${tooltipPos.x - clampedX + halfWidth}px`,
                transform: "translateX(-50%)",
              }}
            />
          </div>
        );
      })()}
    </div>
  );
}
