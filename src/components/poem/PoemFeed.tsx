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
  publishedAt: string | null;
  modelCount: number;
}

interface FeedResponse {
  poems: FeedPoem[];
  pagination: {
    page: number;
    totalPages: number;
    total: number;
  };
}

function groupByDate(poems: FeedPoem[]): Record<string, FeedPoem[]> {
  const groups: Record<string, FeedPoem[]> = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  poems.forEach((poem) => {
    const date = poem.publishedAt ? new Date(poem.publishedAt) : new Date();
    date.setHours(0, 0, 0, 0);

    let key: string;
    if (date.getTime() >= today.getTime()) {
      key = "Today";
    } else if (date.getTime() >= yesterday.getTime()) {
      key = "Yesterday";
    } else if (date.getTime() >= weekAgo.getTime()) {
      key = "This Week";
    } else {
      key = "Earlier";
    }

    if (!groups[key]) groups[key] = [];
    groups[key].push(poem);
  });

  return groups;
}

const GROUP_ORDER = ["Today", "Yesterday", "This Week", "Earlier"];

export function PoemFeed() {
  const [data, setData] = useState<FeedResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/public/poems?limit=50")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="card p-6 h-32 animate-pulse bg-ivory-dark"
          />
        ))}
      </div>
    );
  }

  if (!data || data.poems.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-charcoal-light font-[family-name:var(--font-body)] text-lg">
          No poems analyzed yet.
        </p>
        <p className="text-charcoal-light/60 mt-2 text-sm">
          The first AI-analyzed poems will appear here soon.
        </p>
      </div>
    );
  }

  const grouped = groupByDate(data.poems);

  return (
    <div className="space-y-10">
      {GROUP_ORDER.map((group) => {
        const poems = grouped[group];
        if (!poems || poems.length === 0) return null;

        return (
          <div key={group}>
            <h2 className="text-charcoal-light/60 text-xs uppercase tracking-widest mb-4 border-b border-border-light pb-2 font-[family-name:var(--font-ui)]">
              {group}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {poems.map((poem) => (
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
                  modelCount={poem.modelCount}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
