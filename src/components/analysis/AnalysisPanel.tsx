"use client";

import ReactMarkdown from "react-markdown";
import { hebrewifyModelNames } from "@/lib/hebrew-utils";

interface AnalysisPanelProps {
  model: string;
  literaryAnalysis: string;
  thematicAnalysis: string;
  emotionalAnalysis: string;
  culturalAnalysis: string;
  hebrewAnalysis?: string | null;
  language: string;
}

const sectionLabels: Record<string, string> = {
  literary: "Literary Devices & Structure",
  thematic: "Themes & Ideas",
  emotional: "Emotional Arc & Tone",
  cultural: "Cultural & Historical Context",
  hebrew: "Hebrew Poetic Devices",
};

export function AnalysisPanel({
  model,
  literaryAnalysis,
  thematicAnalysis,
  emotionalAnalysis,
  culturalAnalysis,
  hebrewAnalysis,
  language,
}: AnalysisPanelProps) {
  const isHebrew = language === "HE";

  const sections = [
    { key: "cultural", content: culturalAnalysis },
    { key: "literary", content: literaryAnalysis },
    { key: "thematic", content: thematicAnalysis },
    { key: "emotional", content: emotionalAnalysis },
    ...(hebrewAnalysis
      ? [{ key: "hebrew", content: hebrewAnalysis }]
      : []),
  ];

  const modelColor: Record<string, string> = {
    CLAUDE: "border-l-amber-600",
    GPT: "border-l-emerald-600",
    GEMINI: "border-l-violet-600",
  };

  return (
    <div className={`border-l-4 ${modelColor[model] || "border-l-sepia"} pl-4 md:pl-6`}>
      {sections.map(({ key, content }) => (
        <details key={key} className="analysis-section mb-2" open={key === "cultural"}>
          <summary className="font-[family-name:var(--font-ui)]">
            {sectionLabels[key]}
          </summary>
          <div
            className="prose prose-sm max-w-none py-4 text-charcoal-light prose-headings:font-[family-name:var(--font-heading)] prose-p:leading-relaxed"
            dir={isHebrew ? "rtl" : "ltr"}
          >
            <ReactMarkdown>{isHebrew ? hebrewifyModelNames(content) : content}</ReactMarkdown>
          </div>
        </details>
      ))}
    </div>
  );
}
