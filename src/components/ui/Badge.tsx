"use client";

interface BadgeProps {
  variant: "claude" | "gpt" | "gemini" | "en" | "he" | "default";
  children: React.ReactNode;
}

const variantClasses: Record<string, string> = {
  claude: "badge-claude",
  gpt: "badge-gpt",
  gemini: "badge-gemini",
  en: "badge-en",
  he: "badge-he",
  default: "bg-gray-100 text-gray-700",
};

export function Badge({ variant, children }: BadgeProps) {
  return (
    <span className={`badge ${variantClasses[variant] || variantClasses.default}`}>
      {children}
    </span>
  );
}

export function ModelBadge({ model, language }: { model: string; language?: string }) {
  const labels: Record<string, string> = {
    CLAUDE: "Claude",
    GPT: "GPT",
    GEMINI: "Gemini",
  };

  const labelsHe: Record<string, string> = {
    CLAUDE: "קלוד",
    GPT: "ג׳י פי טי",
    GEMINI: "ג׳מיני",
  };

  const names = language === "HE" ? labelsHe : labels;

  return (
    <Badge variant={model.toLowerCase() as "claude" | "gpt" | "gemini"}>
      {names[model] || model}
    </Badge>
  );
}

export function LanguageBadge({ language }: { language: string }) {
  return (
    <Badge variant={language.toLowerCase() as "en" | "he"}>
      {language === "HE" ? "עברית" : "English"}
    </Badge>
  );
}
