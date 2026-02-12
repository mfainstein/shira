"use client";

interface PoemDisplayProps {
  title: string;
  titleHe?: string | null;
  author: string;
  authorHe?: string | null;
  content: string;
  contentHe?: string | null;
  language: string;
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
}: PoemDisplayProps) {
  const isHebrew = language === "HE";
  const displayTitle = isHebrew && titleHe ? titleHe : title;
  const displayAuthor = isHebrew && authorHe ? authorHe : author;
  const displayContent = isHebrew && contentHe ? contentHe : content;
  const stanzas = formatStanzas(displayContent);

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

      <div className="space-y-0">
        {stanzas.map((stanza, i) => (
          <div key={i} className="stanza">
            {stanza.map((line, j) => (
              <p key={j} className="leading-relaxed">
                {line}
              </p>
            ))}
          </div>
        ))}
      </div>

      {/* Show English version for Hebrew poems */}
      {isHebrew && content && content !== contentHe && (
        <div className="mt-12 pt-8 border-t border-border-light">
          <p className="text-sm text-charcoal-light font-[family-name:var(--font-ui)] mb-4" dir="ltr">
            English translation
          </p>
          <div className="poem-text text-charcoal-light text-sm" dir="ltr">
            {formatStanzas(content).map((stanza, i) => (
              <div key={i} className="stanza">
                {stanza.map((line, j) => (
                  <p key={j}>{line}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
