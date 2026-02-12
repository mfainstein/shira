"use client";

import { VocabularyText } from "./VocabularyText";

interface PoemDisplayProps {
  title: string;
  titleHe?: string | null;
  author: string;
  authorHe?: string | null;
  content: string;
  contentHe?: string | null;
  language: string;
  vocabulary?: Record<string, string> | null;
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

export function PoemDisplay({
  title,
  titleHe,
  author,
  authorHe,
  content,
  contentHe,
  language,
  vocabulary,
}: PoemDisplayProps) {
  const isHebrew = language === "HE";
  const displayTitle = isHebrew && titleHe ? titleHe : title;
  const displayAuthor = isHebrew && authorHe ? authorHe : author;
  const displayContent = isHebrew && contentHe ? contentHe : content;
  const hasVocabulary = vocabulary && Object.keys(vocabulary).length > 0;

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
          />
          <p className="text-xs text-charcoal-light/40 mt-6 font-[family-name:var(--font-ui)]" dir="ltr">
            Tap dotted words for definitions
          </p>
        </div>
      ) : (
        <div className="space-y-0">
          {formatStanzas(displayContent).map((stanza, i) => (
            <div key={i} className="stanza">
              {stanza.map((line, j) => (
                <p key={j} className="leading-relaxed">
                  {line}
                </p>
              ))}
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
