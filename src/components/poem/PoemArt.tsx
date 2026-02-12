"use client";

interface PoemArtProps {
  slug: string;
  title: string;
}

export function PoemArt({ slug, title }: PoemArtProps) {
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
