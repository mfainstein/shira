"use client";

import { useEffect, useState } from "react";
import { LanguageBadge, ModelBadge } from "@/components/ui/Badge";

interface Poem {
  id: string;
  title: string;
  titleHe?: string;
  author: string;
  language: string;
  source: string;
  themes: string[];
  createdAt: string;
  analyses: { id: string; model: string; status: string }[];
  art: { id: string; style: string; status: string }[];
  feature: { id: string; slug: string; status: string } | null;
  jobs: { id: string; status: string; progress: number }[];
}

export default function AdminPoemsPage() {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [triggerForm, setTriggerForm] = useState({
    acquisitionMode: "found",
    topic: "",
    language: "EN",
    artStyle: "MINIMALIST",
    sourceModel: "",
  });
  const [triggering, setTriggering] = useState(false);

  const fetchPoems = async () => {
    const res = await fetch("/api/poems");
    if (res.ok) {
      const data = await res.json();
      setPoems(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPoems();
  }, []);

  const handleTrigger = async (e: React.FormEvent) => {
    e.preventDefault();
    setTriggering(true);

    try {
      const res = await fetch("/api/poems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(triggerForm),
      });

      if (res.ok) {
        setShowModal(false);
        setTriggerForm({
          acquisitionMode: "found",
          topic: "",
          language: "EN",
          artStyle: "MINIMALIST",
          sourceModel: "",
        });
        fetchPoems();
      }
    } finally {
      setTriggering(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this poem and all related data?")) return;
    await fetch(`/api/poems/${id}`, { method: "DELETE" });
    fetchPoems();
  };

  if (loading) {
    return <div className="animate-pulse">Loading poems...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl poem-title">Poems</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-sepia text-white rounded text-sm hover:bg-sepia-light transition-colors"
        >
          Trigger Pipeline
        </button>
      </div>

      {/* Poem list */}
      <div className="space-y-3">
        {poems.map((poem) => (
          <div key={poem.id} className="card p-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium truncate">{poem.title}</h3>
                <LanguageBadge language={poem.language} />
                {poem.feature && (
                  <span
                    className={`badge ${
                      poem.feature.status === "PUBLISHED"
                        ? "bg-emerald-100 text-emerald-700"
                        : poem.feature.status === "DRAFT"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {poem.feature.status}
                  </span>
                )}
              </div>
              <p className="text-sm text-charcoal-light">
                {poem.author} &bull; {poem.source}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {poem.analyses.map((a) => (
                <ModelBadge key={a.id} model={a.model} />
              ))}
            </div>

            <div className="flex items-center gap-2 text-sm">
              {poem.jobs[0] && (
                <span className="text-charcoal-light">
                  {poem.jobs[0].status} ({poem.jobs[0].progress}%)
                </span>
              )}
              <button
                onClick={() => handleDelete(poem.id)}
                className="text-red-400 hover:text-red-600 text-xs"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {poems.length === 0 && (
          <p className="text-center py-12 text-charcoal-light">
            No poems yet. Trigger the pipeline to get started.
          </p>
        )}
      </div>

      {/* Trigger Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="card p-8 w-full max-w-md">
            <h2 className="text-xl poem-title mb-6">Trigger Analysis Pipeline</h2>
            <form onSubmit={handleTrigger} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Acquisition Mode
                </label>
                <select
                  value={triggerForm.acquisitionMode}
                  onChange={(e) =>
                    setTriggerForm({ ...triggerForm, acquisitionMode: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded bg-white"
                >
                  <option value="found">Found (search for existing poem)</option>
                  <option value="ai_generated">AI Generated</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Topic / Themes
                </label>
                <input
                  type="text"
                  value={triggerForm.topic}
                  onChange={(e) =>
                    setTriggerForm({ ...triggerForm, topic: e.target.value })
                  }
                  placeholder="love, nature, loss"
                  className="w-full px-3 py-2 border border-border rounded bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Language
                </label>
                <select
                  value={triggerForm.language}
                  onChange={(e) =>
                    setTriggerForm({ ...triggerForm, language: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded bg-white"
                >
                  <option value="EN">English</option>
                  <option value="HE">Hebrew</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Art Style
                </label>
                <select
                  value={triggerForm.artStyle}
                  onChange={(e) =>
                    setTriggerForm({ ...triggerForm, artStyle: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded bg-white"
                >
                  <option value="MINIMALIST">Minimalist (canvas)</option>
                  <option value="DALLE">DALL-E</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 border border-border rounded text-sm hover:bg-ivory-dark"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={triggering}
                  className="flex-1 py-2 bg-sepia text-white rounded text-sm hover:bg-sepia-light disabled:opacity-50"
                >
                  {triggering ? "Starting..." : "Start Pipeline"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
