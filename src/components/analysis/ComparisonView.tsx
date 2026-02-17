"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { ModelBadge } from "@/components/ui/Badge";
import { hebrewifyModelNames } from "@/lib/hebrew-utils";

interface Insight {
  model: string;
  insight: string;
}

interface ComparisonViewProps {
  comparisonContent: string;
  agreements: string[];
  disagreements: string[];
  insights: Insight[];
  language: string;
}

export function ComparisonView({
  comparisonContent,
  agreements,
  disagreements,
  insights,
  language,
}: ComparisonViewProps) {
  const isHebrew = language === "HE";
  const [view, setView] = useState<"structured" | "essay">("structured");

  return (
    <div>
      {/* View toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setView("structured")}
          className={`px-4 py-2 rounded text-sm ${
            view === "structured"
              ? "bg-sepia text-white"
              : "bg-white border border-border"
          }`}
        >
          Structured View
        </button>
        <button
          onClick={() => setView("essay")}
          className={`px-4 py-2 rounded text-sm ${
            view === "essay"
              ? "bg-sepia text-white"
              : "bg-white border border-border"
          }`}
        >
          Essay View
        </button>
      </div>

      {view === "structured" ? (
        <div className="space-y-8">
          {/* Agreements */}
          {agreements.length > 0 && (
            <div>
              <h3 className="text-lg font-[family-name:var(--font-heading)] mb-3 text-emerald-700">
                Points of Agreement
              </h3>
              <ul className="space-y-2">
                {agreements.map((point, i) => (
                  <li
                    key={i}
                    className="flex gap-3 text-sm text-charcoal-light"
                  >
                    <span className="text-emerald-500 mt-0.5 shrink-0">&#10003;</span>
                    <span>{isHebrew ? hebrewifyModelNames(point) : point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Disagreements */}
          {disagreements.length > 0 && (
            <div>
              <h3 className="text-lg font-[family-name:var(--font-heading)] mb-3 text-amber-700">
                Points of Divergence
              </h3>
              <ul className="space-y-2">
                {disagreements.map((point, i) => (
                  <li
                    key={i}
                    className="flex gap-3 text-sm text-charcoal-light"
                  >
                    <span className="text-amber-500 mt-0.5 shrink-0">&#9674;</span>
                    <span>{isHebrew ? hebrewifyModelNames(point) : point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Unique insights */}
          {insights.length > 0 && (
            <div>
              <h3 className="text-lg font-[family-name:var(--font-heading)] mb-3 text-violet-700">
                Unique Insights
              </h3>
              <div className="space-y-4">
                {insights.map((item, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <ModelBadge model={item.model} language={language} />
                    <p className="text-sm text-charcoal-light flex-1">
                      {isHebrew ? hebrewifyModelNames(item.insight) : item.insight}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="prose prose-sm max-w-none prose-headings:font-[family-name:var(--font-heading)] prose-p:text-charcoal-light prose-li:text-charcoal-light">
          <ReactMarkdown>{isHebrew ? hebrewifyModelNames(comparisonContent) : comparisonContent}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
