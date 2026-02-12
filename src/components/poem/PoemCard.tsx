"use client";

import Link from "next/link";
import { LanguageBadge } from "@/components/ui/Badge";

interface PoemCardProps {
  slug: string;
  title: string;
  titleHe?: string | null;
  author: string;
  authorHe?: string | null;
  language: string;
  themes: string[];
  content: string;
  hasArt: boolean;
}

export function PoemCard({
  slug,
  title,
  titleHe,
  author,
  authorHe,
  language,
  themes,
  content,
  hasArt,
}: PoemCardProps) {
  const isHebrew = language === "HE";
  const displayTitle = isHebrew && titleHe ? titleHe : title;
  const displayAuthor = isHebrew && authorHe ? authorHe : author;

  // Get first 2-3 lines as preview
  const preview = content
    .split("\n")
    .filter((l) => l.trim())
    .slice(0, 3)
    .join(" / ");

  return (
    <Link href={`/poems/${slug}`}>
      <div className="card p-6 h-full flex flex-col">
        {hasArt && (
          <div className="mb-4 h-40 rounded overflow-hidden bg-ivory-dark">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/public/poems/${slug}/art`}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        <div
          className={`flex-1 ${isHebrew ? "text-right" : ""}`}
          dir={isHebrew ? "rtl" : "ltr"}
        >
          <h3
            className={`text-xl mb-1 ${
              isHebrew ? "poem-title-he" : "poem-title"
            }`}
          >
            {displayTitle}
          </h3>
          <p className="text-charcoal-light text-sm mb-3 font-[family-name:var(--font-ui)]">
            {displayAuthor}
          </p>
          <p
            className={`text-sm text-charcoal-light line-clamp-2 mb-4 ${
              isHebrew
                ? "font-[family-name:var(--font-hebrew)]"
                : "font-[family-name:var(--font-body)]"
            }`}
          >
            {preview}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <LanguageBadge language={language} />
          {themes.slice(0, 3).map((theme) => (
            <span
              key={theme}
              className="badge bg-ivory-dark text-charcoal-light"
            >
              {theme}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
