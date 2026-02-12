"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { ModelBadge } from "@/components/ui/Badge";

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
  const [view, setView] = useState<"prose" | "structured">("prose");
  const isHebrew = language === "HE";

  return (
    <div dir={isHebrew ? "rtl" : "ltr"}>
      <h2 className={`text-2xl poem-title mb-6 ${isHebrew ? "text-right" : ""}`}>
        {isHebrew ? "איפה הם מסכימים ואיפה חולקים" : "Where They Agree and Diverge"}
      </h2>

      {/* View toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setView("prose")}
          className={`px-4 py-2 rounded text-sm ${
            view === "prose"
              ? "bg-sepia text-white"
              : "bg-white border border-border"
          }`}
        >
          {isHebrew ? "תצוגת מאמר" : "Essay View"}
        </button>
        <button
          onClick={() => setView("structured")}
          className={`px-4 py-2 rounded text-sm ${
            view === "structured"
              ? "bg-sepia text-white"
              : "bg-white border border-border"
          }`}
        >
          {isHebrew ? "תצוגה מובנית" : "Structured View"}
        </button>
      </div>

      {view === "prose" ? (
        <div className="prose-poem text-charcoal-light">
          <ReactMarkdown>{comparisonContent}</ReactMarkdown>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Agreements */}
          {agreements.length > 0 && (
            <div>
              <h3 className="text-lg font-[family-name:var(--font-heading)] mb-3 text-emerald-700">
                {isHebrew ? "הסכמות" : "Points of Agreement"}
              </h3>
              <ul className="space-y-2">
                {agreements.map((point, i) => (
                  <li
                    key={i}
                    className="flex gap-3 text-sm text-charcoal-light"
                  >
                    <span className="text-emerald-500 mt-0.5">&#10003;</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Disagreements */}
          {disagreements.length > 0 && (
            <div>
              <h3 className="text-lg font-[family-name:var(--font-heading)] mb-3 text-amber-700">
                {isHebrew ? "מחלוקות" : "Points of Divergence"}
              </h3>
              <ul className="space-y-2">
                {disagreements.map((point, i) => (
                  <li
                    key={i}
                    className="flex gap-3 text-sm text-charcoal-light"
                  >
                    <span className="text-amber-500 mt-0.5">&#9674;</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Unique insights */}
          {insights.length > 0 && (
            <div>
              <h3 className="text-lg font-[family-name:var(--font-heading)] mb-3 text-violet-700">
                {isHebrew ? "תובנות ייחודיות" : "Unique Insights"}
              </h3>
              <div className="space-y-4">
                {insights.map((item, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <ModelBadge model={item.model} />
                    <p className="text-sm text-charcoal-light flex-1">
                      {item.insight}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
