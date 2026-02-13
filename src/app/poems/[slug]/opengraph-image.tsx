import { ImageResponse } from "next/og";
import db from "@/lib/db";

export const runtime = "nodejs";
export const alt = "Poem on shira.ink";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const feature = await db.poemFeature.findUnique({
    where: { slug },
    include: {
      poem: {
        select: {
          title: true,
          titleHe: true,
          author: true,
          authorHe: true,
          content: true,
          contentHe: true,
          language: true,
        },
      },
    },
  });

  if (!feature) {
    return fallbackImage();
  }

  const { poem } = feature;
  const isHebrew = poem.language === "HE";
  const title = isHebrew && poem.titleHe ? poem.titleHe : poem.title;
  const author = isHebrew && poem.authorHe ? poem.authorHe : poem.author;
  const content = isHebrew && poem.contentHe ? poem.contentHe : poem.content;

  // Get first 4 lines for preview
  const lines = content
    .split("\n")
    .filter(Boolean)
    .slice(0, 4);

  const direction = isHebrew ? "rtl" : "ltr";
  const textAlign = isHebrew ? "right" : "left";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#faf8f5",
          fontFamily: "Georgia, serif",
          padding: 60,
        }}
      >
        {/* Border frame */}
        <div
          style={{
            position: "absolute",
            top: 24,
            left: 24,
            right: 24,
            bottom: 24,
            border: "1px solid #e5ddd3",
            display: "flex",
          }}
        />

        {/* Title */}
        <div
          style={{
            fontSize: title.length > 30 ? 42 : 54,
            fontWeight: 700,
            color: "#1a1a2e",
            direction,
            textAlign,
            lineHeight: 1.2,
            marginBottom: 8,
          }}
        >
          {title}
        </div>

        {/* Author */}
        <div
          style={{
            fontSize: 24,
            color: "#4a4a4a",
            direction,
            textAlign,
            marginBottom: 32,
          }}
        >
          {author}
        </div>

        {/* Divider */}
        <div
          style={{
            width: 60,
            height: 1,
            backgroundColor: "#8b5e3c",
            opacity: 0.4,
            marginBottom: 32,
            alignSelf: isHebrew ? "flex-end" : "flex-start",
            display: "flex",
          }}
        />

        {/* Poem preview */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            flex: 1,
            direction,
            textAlign,
          }}
        >
          {lines.map((line, i) => (
            <div
              key={i}
              style={{
                fontSize: 22,
                color: "#2c2c2c",
                lineHeight: 1.8,
                fontStyle: "italic",
              }}
            >
              {line}
            </div>
          ))}
          {content.split("\n").filter(Boolean).length > 4 && (
            <div
              style={{
                fontSize: 22,
                color: "#4a4a4a",
                opacity: 0.5,
              }}
            >
              ...
            </div>
          )}
        </div>

        {/* Footer branding */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              fontSize: 28,
              fontWeight: 700,
              color: "#1a1a2e",
            }}
          >
            shira
            <span style={{ opacity: 0.3, marginLeft: 2 }}>·</span>
          </div>
          <div
            style={{
              fontSize: 16,
              color: "#8b5e3c",
              opacity: 0.5,
            }}
          >
            shira.ink
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}

function fallbackImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#faf8f5",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            fontSize: 72,
            fontWeight: 700,
            color: "#1a1a2e",
          }}
        >
          shira
          <span style={{ opacity: 0.3, marginLeft: 4 }}>·</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
