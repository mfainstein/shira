"use client";

import { useState } from "react";
import { AnalysisPanel } from "./AnalysisPanel";
import { ModelBadge } from "@/components/ui/Badge";

interface Analysis {
  id: string;
  model: string;
  literaryAnalysis: string;
  thematicAnalysis: string;
  emotionalAnalysis: string;
  culturalAnalysis: string;
  hebrewAnalysis?: string | null;
}

interface AnalysisTabsProps {
  analyses: Analysis[];
  language: string;
}

const modelNames: Record<string, string> = {
  CLAUDE: "Claude",
  GPT: "GPT",
  GEMINI: "Gemini",
};

const modelColors: Record<string, { bg: string; border: string; text: string }> = {
  CLAUDE: { bg: "bg-amber-50", border: "border-amber-300", text: "text-amber-700" },
  GPT: { bg: "bg-emerald-50", border: "border-emerald-300", text: "text-emerald-700" },
  GEMINI: { bg: "bg-violet-50", border: "border-violet-300", text: "text-violet-700" },
};

export function AnalysisTabs({ analyses, language }: AnalysisTabsProps) {
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  const handleReveal = (model: string) => {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(model)) {
        next.delete(model);
      } else {
        next.add(model);
      }
      return next;
    });
  };

  return (
    <div>
      <h2 className="text-2xl poem-title mb-2">Three Perspectives</h2>
      <p className="text-charcoal-light mb-6 text-sm">
        Tap on a model to reveal its analysis
      </p>

      {/* Stacked cards - works on all screen sizes */}
      <div className="space-y-4">
        {analyses.map((analysis) => {
          const isRevealed = revealed.has(analysis.model);
          const colors = modelColors[analysis.model] || modelColors.CLAUDE;

          return (
            <div key={analysis.model} className="rounded-lg border border-border overflow-hidden">
              {/* Clickable header */}
              <button
                onClick={() => handleReveal(analysis.model)}
                className={`w-full px-5 py-4 flex items-center justify-between transition-colors ${
                  isRevealed
                    ? `${colors.bg} ${colors.border} border-b`
                    : "bg-white hover:bg-ivory-dark"
                }`}
              >
                <div className="flex items-center gap-3">
                  <ModelBadge model={analysis.model} />
                  <span className={`font-medium text-sm ${isRevealed ? colors.text : "text-charcoal"}`}>
                    {modelNames[analysis.model] || analysis.model}
                  </span>
                </div>
                <span className={`text-xs transition-transform ${isRevealed ? "rotate-180" : ""}`}>
                  &#9660;
                </span>
              </button>

              {/* Expandable content */}
              {isRevealed && (
                <div className="p-5">
                  <AnalysisPanel
                    model={analysis.model}
                    literaryAnalysis={analysis.literaryAnalysis}
                    thematicAnalysis={analysis.thematicAnalysis}
                    emotionalAnalysis={analysis.emotionalAnalysis}
                    culturalAnalysis={analysis.culturalAnalysis}
                    hebrewAnalysis={analysis.hebrewAnalysis}
                    language={language}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
