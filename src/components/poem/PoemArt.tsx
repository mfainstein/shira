"use client";

import { MinimalistCanvas } from "./MinimalistCanvas";

interface PoemArtProps {
  slug: string;
  drawCommands?: Record<string, unknown> | null;
  style: string;
  title: string;
}

export function PoemArt({ slug, drawCommands, style, title }: PoemArtProps) {
  if (style === "MINIMALIST" && drawCommands) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <MinimalistCanvas
          drawCommands={drawCommands as { paths: Array<Record<string, unknown>> }}
          width={1200}
          height={800}
          title={title}
        />
      </div>
    );
  }

  // Fallback to image from API
  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/api/public/poems/${slug}/art`}
        alt={`Artwork for ${title}`}
        className="w-full rounded-lg shadow-sm"
        loading="lazy"
      />
    </div>
  );
}
