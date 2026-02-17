"use client";

import { useState, useCallback } from "react";
import { VocabularyText } from "./VocabularyText";
import { LineExplanation } from "./LineExplanation";

interface PoemDisplayProps {
  title: string;
  titleHe?: string | null;
  author: string;
  authorHe?: string | null;
  content: string;
  contentHe?: string | null;
  language: string;
  vocabulary?: Record<string, string> | null;
  lineExplanations?: Record<string, string> | null;
}

function formatStanzas(text: string): string[][] {
  const lines = text.split("\n");
  const stanzas: string[][] = [];
  let currentStanza: string[] = [];

  for (const line of lines) {
    if (line.trim() === "") {
      if (currentStanza.length > 0) {
        stanzas.push(currentStanza);
        currentStanza = [];
      }
    } else {
      currentStanza.push(line);
    }
  }

  if (currentStanza.length > 0) {
    stanzas.push(currentStanza);
  }

  return stanzas;
}

function ExplainIcon({ isOpen, onClick, isHebrew }: { isOpen: boolean; onClick: () => void; isHebrew: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`absolute top-1 inline-flex items-center justify-center w-5 h-5 rounded-full transition-colors ${
        isOpen
          ? "text-sepia"
          : "text-charcoal-light/30 hover:text-sepia/60"
      } ${isHebrew ? "left-0 -translate-x-full -ml-1" : "right-0 translate-x-full ml-1"}`}
      aria-label="Explain this line"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18h6" />
        <path d="M10 22h4" />
        <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
      </svg>
    </button>
  );
}

export function PoemDisplay({
  title,
  titleHe,
  author,
  authorHe,
  content,
  contentHe,
  language,
  vocabulary,
  lineExplanations,
}: PoemDisplayProps) {
  const isHebrew = language === "HE";
  const displayTitle = isHebrew && titleHe ? titleHe : title;
  const displayAuthor = isHebrew && authorHe ? authorHe : author;
  const displayContent = isHebrew && contentHe ? contentHe : content;
  const hasVocabulary = vocabulary && Object.keys(vocabulary).length > 0;

  const [openLines, setOpenLines] = useState<Set<string>>(new Set());

  const toggleLine = useCallback((line: string) => {
    setOpenLines((prev) => {
      const next = new Set(prev);
      if (next.has(line)) {
        next.delete(line);
      } else {
        next.add(line);
      }
      return next;
    });
  }, []);

  const getExplanation = (line: string): string | undefined => {
    if (!lineExplanations) return undefined;
    return lineExplanations[line] || lineExplanations[line.trim()];
  };

  return (
    <div
      className={`max-w-2xl mx-auto text-center ${isHebrew ? "poem-text-he" : "poem-text"}`}
      dir={isHebrew ? "rtl" : "ltr"}
    >
      <h1
        className={`text-3xl md:text-4xl mb-2 ${
          isHebrew ? "poem-title-he" : "poem-title"
        }`}
      >
        {displayTitle}
      </h1>

      <p className="text-charcoal-light text-lg mb-8 font-[family-name:var(--font-ui)]">
        {displayAuthor}
      </p>

      {hasVocabulary ? (
        <div className="space-y-0">
          <VocabularyText
            text={displayContent}
            vocabulary={vocabulary}
            isHebrew={isHebrew}
            lineExplanations={lineExplanations}
            openLines={openLines}
            onToggleLine={toggleLine}
          />
          <p className="text-xs text-charcoal-light/40 mt-6 font-[family-name:var(--font-ui)]" dir="ltr">
            Tap dotted words for definitions
          </p>
        </div>
      ) : (
        <div className="space-y-0">
          {formatStanzas(displayContent).map((stanza, i) => (
            <div key={i} className="stanza">
              {stanza.map((line, j) => {
                const explanation = getExplanation(line);

                return (
                  <div key={j} className={explanation ? "relative" : ""}>
                    <p className={`leading-relaxed ${i === 0 && j === 0 ? "drop-cap" : ""}`}>
                      {line}
                    </p>
                    {explanation && (
                      <ExplainIcon
                        isOpen={openLines.has(line.trim())}
                        onClick={() => toggleLine(line.trim())}
                        isHebrew={isHebrew}
                      />
                    )}
                    {explanation && (
                      <LineExplanation
                        explanation={explanation}
                        isOpen={openLines.has(line.trim())}
                        isHebrew={isHebrew}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Show English translation for Hebrew poems */}
      {isHebrew && content && contentHe && content !== contentHe && (
        <details className="mt-12 pt-8 border-t border-border-light">
          <summary className="text-sm text-charcoal-light font-[family-name:var(--font-ui)] cursor-pointer hover:text-sepia transition-colors" dir="ltr">
            Show English translation
          </summary>
          <div className="poem-text text-charcoal-light text-sm mt-4" dir="ltr">
            {formatStanzas(content).map((stanza, i) => (
              <div key={i} className="stanza">
                {stanza.map((line, j) => (
                  <p key={j}>{line}</p>
                ))}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
