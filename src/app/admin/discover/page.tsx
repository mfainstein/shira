"use client";

import { useState, useEffect } from "react";

interface RegistryPoem {
  title: string;
  titleHe?: string;
  author: string;
  authorHe?: string;
  language: "EN" | "HE";
  themes: string[];
}

interface Stats {
  total: number;
  he: number;
  en: number;
  poets: { name: string; count: number }[];
}

export default function DiscoverPage() {
  const [poet, setPoet] = useState("");
  const [language, setLanguage] = useState<"EN" | "HE">("HE");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<RegistryPoem[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [adding, setAdding] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const res = await fetch("/api/admin/discover/stats");
      if (res.ok) {
        setStats(await res.json());
      }
    } catch {
      // Stats are optional
    }
  }

  async function handleDiscover() {
    if (!poet.trim()) return;
    setLoading(true);
    setMessage("");
    setSuggestions([]);
    setSelected(new Set());

    try {
      const res = await fetch("/api/admin/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ poet: poet.trim(), language }),
      });

      if (!res.ok) {
        setMessage("Failed to discover poems");
        return;
      }

      const data = await res.json();
      setSuggestions(data.poems || []);
      // Select all by default
      setSelected(new Set(data.poems?.map((_: RegistryPoem, i: number) => i) || []));
    } catch {
      setMessage("Error discovering poems");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    const toAdd = suggestions.filter((_, i) => selected.has(i));
    if (toAdd.length === 0) return;

    setAdding(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", poems: toAdd }),
      });

      if (!res.ok) {
        setMessage("Failed to add poems");
        return;
      }

      const data = await res.json();
      setMessage(`Added ${data.added} poems to registry`);
      setSuggestions([]);
      setSelected(new Set());
      loadStats();
    } catch {
      setMessage("Error adding poems");
    } finally {
      setAdding(false);
    }
  }

  function toggleSelect(index: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(suggestions.map((_, i) => i)));
  }

  function selectNone() {
    setSelected(new Set());
  }

  return (
    <div>
      <h1 className="text-2xl poem-title mb-6">Discover Poems</h1>

      {/* Stats */}
      {stats && (
        <div className="mb-6 p-4 bg-ivory-dark rounded-lg text-sm">
          <div className="font-medium mb-2">Registry Stats</div>
          <div className="flex gap-6">
            <span>Total: {stats.total}</span>
            <span>Hebrew: {stats.he}</span>
            <span>English: {stats.en}</span>
          </div>
          {stats.poets.length > 0 && (
            <div className="mt-2 text-charcoal-light">
              Top poets:{" "}
              {stats.poets
                .slice(0, 8)
                .map((p) => `${p.name} (${p.count})`)
                .join(", ")}
            </div>
          )}
        </div>
      )}

      {/* Search */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          value={poet}
          onChange={(e) => setPoet(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleDiscover()}
          placeholder="Poet name (e.g. דוד אבידן or Robert Frost)"
          className="flex-1 px-4 py-2 border border-border rounded text-sm"
        />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as "EN" | "HE")}
          className="px-3 py-2 border border-border rounded text-sm"
        >
          <option value="HE">Hebrew</option>
          <option value="EN">English</option>
        </select>
        <button
          onClick={handleDiscover}
          disabled={loading || !poet.trim()}
          className="px-6 py-2 bg-sepia text-white rounded text-sm hover:bg-sepia/90 disabled:opacity-50"
        >
          {loading ? "Discovering..." : "Discover"}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className="mb-4 p-3 bg-sepia/10 text-sepia rounded text-sm">
          {message}
        </div>
      )}

      {/* Results */}
      {suggestions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-medium">
              {suggestions.length} poems found — {selected.size} selected
            </h2>
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                className="text-sm text-sepia hover:underline"
              >
                Select all
              </button>
              <span className="text-charcoal-light">|</span>
              <button
                onClick={selectNone}
                className="text-sm text-sepia hover:underline"
              >
                Select none
              </button>
            </div>
          </div>

          <div className="space-y-2 mb-6">
            {suggestions.map((poem, i) => (
              <label
                key={i}
                className={`flex items-start gap-3 p-3 rounded border cursor-pointer transition-colors ${
                  selected.has(i)
                    ? "border-sepia bg-sepia/5"
                    : "border-border hover:bg-ivory-dark"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected.has(i)}
                  onChange={() => toggleSelect(i)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">
                    {poem.title}
                    {poem.titleHe && (
                      <span className="text-charcoal-light ml-2">
                        {poem.titleHe}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-charcoal-light mt-0.5">
                    {poem.author}
                    {poem.authorHe && ` / ${poem.authorHe}`}
                    <span className="mx-2">·</span>
                    {poem.themes.join(", ")}
                  </div>
                </div>
              </label>
            ))}
          </div>

          <button
            onClick={handleAdd}
            disabled={adding || selected.size === 0}
            className="px-6 py-2 bg-sepia text-white rounded text-sm hover:bg-sepia/90 disabled:opacity-50"
          >
            {adding ? "Adding..." : `Add ${selected.size} Selected`}
          </button>
        </div>
      )}
    </div>
  );
}
