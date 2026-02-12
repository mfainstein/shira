"use client";

import ReactMarkdown from "react-markdown";

interface AnalysisPanelProps {
  model: string;
  literaryAnalysis: string;
  thematicAnalysis: string;
  emotionalAnalysis: string;
  culturalAnalysis: string;
  hebrewAnalysis?: string | null;
  language: string;
}

const sectionLabels: Record<string, { en: string; he: string }> = {
  literary: { en: "Literary Devices & Structure", he: "אמצעים ספרותיים ומבנה" },
  thematic: { en: "Themes & Ideas", he: "נושאים ורעיונות" },
  emotional: { en: "Emotional Arc & Tone", he: "מסע רגשי וטון" },
  cultural: { en: "Cultural & Historical Context", he: "הקשר תרבותי והיסטורי" },
  hebrew: { en: "Hebrew Poetic Devices", he: "אמצעים שיריים עבריים" },
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
  const getLabel = (key: string) =>
    isHebrew ? sectionLabels[key].he : sectionLabels[key].en;

  const sections = [
    { key: "literary", content: literaryAnalysis },
    { key: "thematic", content: thematicAnalysis },
    { key: "emotional", content: emotionalAnalysis },
    { key: "cultural", content: culturalAnalysis },
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
    <div
      className={`border-l-4 ${modelColor[model] || "border-l-sepia"} pl-6`}
      dir={isHebrew ? "rtl" : "ltr"}
    >
      {sections.map(({ key, content }) => (
        <details key={key} className="analysis-section mb-2" open={key === "literary"}>
          <summary>{getLabel(key)}</summary>
          <div className="prose-poem py-4 text-charcoal-light text-[0.95rem]">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </details>
      ))}
    </div>
  );
}
