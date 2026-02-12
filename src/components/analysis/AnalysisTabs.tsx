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

const modelAccents: Record<string, string> = {
  CLAUDE: "border-b-amber-600 text-amber-700",
  GPT: "border-b-emerald-600 text-emerald-700",
  GEMINI: "border-b-violet-600 text-violet-700",
};

export function AnalysisTabs({ analyses, language }: AnalysisTabsProps) {
  const [activeModel, setActiveModel] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  const handleReveal = (model: string) => {
    setRevealed((prev) => new Set(prev).add(model));
    setActiveModel(model);
  };

  const activeAnalysis = analyses.find((a) => a.model === activeModel);
  const isHebrew = language === "HE";

  return (
    <div>
      <h2
        className={`text-2xl poem-title mb-6 ${isHebrew ? "text-right" : ""}`}
        dir={isHebrew ? "rtl" : "ltr"}
      >
        {isHebrew ? "שלוש נקודות מבט" : "Three Perspectives"}
      </h2>

      <p
        className={`text-charcoal-light mb-6 text-sm ${isHebrew ? "text-right" : ""}`}
        dir={isHebrew ? "rtl" : "ltr"}
      >
        {isHebrew
          ? "לחץ על שם המודל כדי לחשוף את הניתוח שלו"
          : "Click on a model name to reveal its analysis"}
      </p>

      {/* Tab buttons */}
      <div className="flex border-b border-border mb-6" role="tablist">
        {analyses.map((analysis) => {
          const isRevealed = revealed.has(analysis.model);
          const isActive = activeModel === analysis.model;

          return (
            <button
              key={analysis.model}
              role="tab"
              aria-selected={isActive}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-all ${
                isActive
                  ? modelAccents[analysis.model] || "border-b-sepia text-sepia"
                  : isRevealed
                    ? "border-b-transparent text-charcoal-light hover:text-charcoal"
                    : "border-b-transparent text-charcoal-light/40 hover:text-charcoal-light"
              }`}
              onClick={() => handleReveal(analysis.model)}
            >
              <span className="flex items-center gap-2">
                {modelNames[analysis.model] || analysis.model}
                {!isRevealed && (
                  <span className="text-xs opacity-50">
                    {isHebrew ? "לחץ לחשיפה" : "click to reveal"}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeModel && activeAnalysis ? (
        <div className="transition-opacity duration-300">
          <div className="mb-4">
            <ModelBadge model={activeModel} />
          </div>
          <AnalysisPanel
            model={activeAnalysis.model}
            literaryAnalysis={activeAnalysis.literaryAnalysis}
            thematicAnalysis={activeAnalysis.thematicAnalysis}
            emotionalAnalysis={activeAnalysis.emotionalAnalysis}
            culturalAnalysis={activeAnalysis.culturalAnalysis}
            hebrewAnalysis={activeAnalysis.hebrewAnalysis}
            language={language}
          />
        </div>
      ) : (
        <div
          className="text-center py-12 text-charcoal-light/50"
          dir={isHebrew ? "rtl" : "ltr"}
        >
          <p className="text-lg font-[family-name:var(--font-body)]">
            {isHebrew
              ? "בחר מודל כדי לראות את הניתוח שלו"
              : "Choose a model above to see its analysis"}
          </p>
        </div>
      )}
    </div>
  );
}
