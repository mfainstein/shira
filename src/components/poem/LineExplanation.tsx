"use client";

interface LineExplanationProps {
  explanation: string;
  isOpen: boolean;
  isHebrew: boolean;
}

export function LineExplanation({ explanation, isOpen, isHebrew }: LineExplanationProps) {
  return (
    <div
      className="overflow-hidden transition-all duration-300 ease-in-out"
      style={{
        maxHeight: isOpen ? "4rem" : "0",
        opacity: isOpen ? 1 : 0,
      }}
    >
      <p
        className={`text-sm italic leading-relaxed py-1 ${
          isHebrew
            ? "font-[family-name:var(--font-hebrew)] text-sepia-light/70"
            : "font-[family-name:var(--font-serif)] text-sepia-light/70"
        }`}
      >
        {explanation}
      </p>
    </div>
  );
}
