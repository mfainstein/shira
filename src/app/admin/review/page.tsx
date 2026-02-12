"use client";

import { useEffect, useState } from "react";
import { LanguageBadge, ModelBadge } from "@/components/ui/Badge";

interface ReviewPoem {
  id: string;
  title: string;
  titleHe?: string;
  author: string;
  language: string;
  themes: string[];
  analyses: { id: string; model: string; status: string }[];
  art: { id: string; style: string }[];
  feature: { id: string; slug: string; status: string } | null;
  comparison: { id: string } | null;
}

export default function AdminReviewPage() {
  const [poems, setPoems] = useState<ReviewPoem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPoems = async () => {
    const res = await fetch("/api/poems");
    if (res.ok) {
      const data = await res.json();
      // Filter to DRAFT status
      setPoems(
        data.filter(
          (p: ReviewPoem) => p.feature && p.feature.status === "DRAFT"
        )
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPoems();
  }, []);

  const handlePublish = async (poemId: string) => {
    await fetch(`/api/poems/${poemId}/publish`, { method: "POST" });
    fetchPoems();
  };

  const handleReject = async (poemId: string) => {
    const reason = prompt("Rejection reason:");
    if (reason === null) return;
    await fetch(`/api/poems/${poemId}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    fetchPoems();
  };

  if (loading) {
    return <div className="animate-pulse">Loading review queue...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl poem-title mb-8">Review Queue</h1>

      {poems.length === 0 ? (
        <p className="text-center py-12 text-charcoal-light">
          No poems awaiting review.
        </p>
      ) : (
        <div className="space-y-4">
          {poems.map((poem) => (
            <div key={poem.id} className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-medium">{poem.title}</h3>
                    <LanguageBadge language={poem.language} />
                  </div>
                  <p className="text-sm text-charcoal-light">{poem.author}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handlePublish(poem.id)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700"
                  >
                    Publish
                  </button>
                  <button
                    onClick={() => handleReject(poem.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-charcoal-light">
                <span>
                  Analyses:{" "}
                  {poem.analyses.map((a) => (
                    <ModelBadge key={a.id} model={a.model} />
                  ))}
                </span>
                <span>Art: {poem.art.length > 0 ? "Yes" : "No"}</span>
                <span>
                  Comparison: {poem.comparison ? "Yes" : "No"}
                </span>
                <span>
                  Themes: {(poem.themes as string[]).join(", ")}
                </span>
              </div>

              {poem.feature && (
                <p className="text-xs text-charcoal-light mt-2">
                  Slug: /poems/{poem.feature.slug}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
