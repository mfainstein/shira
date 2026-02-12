"use client";

import { useEffect, useState } from "react";
import { PoemCard } from "./PoemCard";

interface FeedPoem {
  slug: string;
  id: string;
  title: string;
  titleHe?: string | null;
  author: string;
  authorHe?: string | null;
  language: string;
  themes: string[];
  content: string;
  contentHe?: string | null;
  art: { id: string; style: string }[];
}

interface FeedResponse {
  poems: FeedPoem[];
  pagination: {
    page: number;
    totalPages: number;
    total: number;
  };
}

export function PoemFeed() {
  const [data, setData] = useState<FeedResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/public/poems?page=${page}&limit=12`)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [page]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="card p-6 h-64 animate-pulse bg-ivory-dark"
          />
        ))}
      </div>
    );
  }

  if (!data || data.poems.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-charcoal-light font-[family-name:var(--font-body)] text-lg">
          No poems published yet.
        </p>
        <p className="text-charcoal-light/60 mt-2 text-sm">
          Check back soon for fresh perspectives on poetry.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.poems.map((poem) => (
          <PoemCard
            key={poem.slug}
            slug={poem.slug}
            title={poem.title}
            titleHe={poem.titleHe}
            author={poem.author}
            authorHe={poem.authorHe}
            language={poem.language}
            themes={(poem.themes as string[]) || []}
            content={
              poem.language === "HE" && poem.contentHe
                ? poem.contentHe
                : poem.content
            }
            hasArt={poem.art.length > 0}
          />
        ))}
      </div>

      {data.pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          {Array.from(
            { length: data.pagination.totalPages },
            (_, i) => i + 1
          ).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-4 py-2 rounded text-sm ${
                p === page
                  ? "bg-sepia text-white"
                  : "bg-white border border-border hover:bg-ivory-dark"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
