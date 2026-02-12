"use client";

import { useState } from "react";

interface Tab {
  id: string;
  label: string;
  accent?: string;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  children: (activeTab: string) => React.ReactNode;
}

const modelAccents: Record<string, string> = {
  CLAUDE: "border-b-amber-600 text-amber-700",
  GPT: "border-b-emerald-600 text-emerald-700",
  GEMINI: "border-b-violet-600 text-violet-700",
};

export function Tabs({ tabs, defaultTab, onChange, children }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || "");

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  return (
    <div>
      <div className="flex border-b border-border" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`px-6 py-3 font-[family-name:var(--font-ui)] text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? modelAccents[tab.id] || "border-b-sepia text-sepia"
                : "border-b-transparent text-charcoal-light hover:text-charcoal hover:border-b-border"
            }`}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="pt-6" role="tabpanel">
        {children(activeTab)}
      </div>
    </div>
  );
}
