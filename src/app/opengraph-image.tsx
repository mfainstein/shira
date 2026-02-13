import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "shira — AI poetry analysis";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
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
        {/* Subtle border frame */}
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
            display: "flex",
            alignItems: "baseline",
            fontSize: 96,
            fontWeight: 700,
            color: "#1a1a2e",
            letterSpacing: "0.01em",
          }}
        >
          shira
          <span style={{ opacity: 0.3, marginLeft: 4 }}>·</span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 24,
            color: "#4a4a4a",
            marginTop: 16,
            fontStyle: "italic",
            letterSpacing: "0.04em",
          }}
        >
          AI poetry analysis
        </div>

        {/* Domain */}
        <div
          style={{
            position: "absolute",
            bottom: 48,
            fontSize: 18,
            color: "#8b5e3c",
            opacity: 0.6,
          }}
        >
          shira.ink
        </div>
      </div>
    ),
    { ...size }
  );
}
