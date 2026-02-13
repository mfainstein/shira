"use client";

import { useEffect, useState, useRef } from "react";

export function TypewriterTagline() {
  const [text, setText] = useState("");
  const [fullText, setFullText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    fetch("/api/public/tagline")
      .then((res) => res.json())
      .then((data) => {
        if (data.poem) {
          setFullText(data.poem);
          setIsTyping(true);
        }
      })
      .catch(() => {
        setFullText("A poem sits on the page and waits,\nknowing you'll come eventually.");
        setIsTyping(true);
      });
  }, []);

  useEffect(() => {
    if (!isTyping || !fullText) return;

    let i = 0;
    const interval = setInterval(() => {
      if (i <= fullText.length) {
        setText(fullText.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 45);

    return () => clearInterval(interval);
  }, [isTyping, fullText]);

  if (!fullText) {
    return (
      <div className="h-16 flex items-center justify-center">
        <span className="inline-block w-[2px] h-5 bg-[var(--color-ink)]/30 animate-pulse" />
      </div>
    );
  }

  return (
    <p className="font-[family-name:var(--font-body)] text-charcoal-light/70 text-base italic leading-relaxed whitespace-pre-line min-h-[3em]">
      {text}
      {isTyping && (
        <span className="inline-block w-[2px] h-[1em] bg-[var(--color-ink)]/40 ml-0.5 animate-pulse align-text-bottom" />
      )}
    </p>
  );
}
