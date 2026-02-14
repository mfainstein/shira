"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";

interface MoodPoint {
  position: number;
  valence: number;
  arousal: number;
  mood: string;
  label: string;
}

interface AnalysisWithRaw {
  model: string;
  rawResponse: unknown;
}

interface MoodTimelineProps {
  analyses: AnalysisWithRaw[];
}

const MODEL_COLORS: Record<string, string> = {
  CLAUDE: "#d97706",
  GPT: "#059669",
  GEMINI: "#7c3aed",
};

const MODEL_LABELS: Record<string, string> = {
  CLAUDE: "Claude",
  GPT: "GPT",
  GEMINI: "Gemini",
};

// SVG layout constants
const W = 800;
const H = 280;
const PAD_L = 32;
const PAD_R = 16;
const PAD_T = 8;
const PAD_B = 24;
const CHART_W = W - PAD_L - PAD_R;
const CHART_H = H - PAD_T - PAD_B;

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function isValidPoint(p: unknown): p is MoodPoint {
  if (!p || typeof p !== "object") return false;
  const o = p as Record<string, unknown>;
  return (
    typeof o.position === "number" &&
    typeof o.valence === "number" &&
    typeof o.arousal === "number" &&
    typeof o.mood === "string" &&
    typeof o.label === "string"
  );
}

function extractTimeline(raw: unknown): MoodPoint[] | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const arr = obj.moodTimeline;
  if (!Array.isArray(arr)) return null;

  const points: MoodPoint[] = [];
  for (const item of arr) {
    if (isValidPoint(item)) {
      points.push({
        position: clamp(item.position, 0, 1),
        valence: clamp(item.valence, -1, 1),
        arousal: clamp(item.arousal, 0, 1),
        mood: item.mood,
        label: item.label,
      });
    }
  }

  if (points.length < 3) return null;
  points.sort((a, b) => a.position - b.position);
  return points;
}

/** Convert position/valence to SVG x/y */
function toSVG(position: number, valence: number): [number, number] {
  const x = PAD_L + position * CHART_W;
  // valence +1 = top, -1 = bottom
  const y = PAD_T + ((1 - valence) / 2) * CHART_H;
  return [x, y];
}

/**
 * Catmull-Rom to cubic Bezier conversion.
 * Produces a smooth SVG path through all points.
 */
function catmullRomPath(points: MoodPoint[]): string {
  if (points.length < 2) return "";

  const coords = points.map((p) => toSVG(p.position, p.valence));

  if (coords.length === 2) {
    return `M${coords[0][0]},${coords[0][1]} L${coords[1][0]},${coords[1][1]}`;
  }

  let d = `M${coords[0][0]},${coords[0][1]}`;
  const alpha = 0.5; // centripetal

  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[Math.max(0, i - 1)];
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const p3 = coords[Math.min(coords.length - 1, i + 2)];

    const d1 = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
    const d0 = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
    const d2 = Math.hypot(p3[0] - p2[0], p3[1] - p2[1]);

    const b1x =
      p1[0] + (p2[0] - p0[0]) / (6 * Math.max(1, (d0 ** alpha) / (d1 ** alpha) + 1));
    const b1y =
      p1[1] + (p2[1] - p0[1]) / (6 * Math.max(1, (d0 ** alpha) / (d1 ** alpha) + 1));
    const b2x =
      p2[0] - (p3[0] - p1[0]) / (6 * Math.max(1, (d2 ** alpha) / (d1 ** alpha) + 1));
    const b2y =
      p2[1] - (p3[1] - p1[1]) / (6 * Math.max(1, (d2 ** alpha) / (d1 ** alpha) + 1));

    d += ` C${b1x.toFixed(1)},${b1y.toFixed(1)} ${b2x.toFixed(1)},${b2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }

  return d;
}

export function MoodTimeline({ analyses }: MoodTimelineProps) {
  const [entered, setEntered] = useState(false);
  const [hoveredModel, setHoveredModel] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{
    model: string;
    point: MoodPoint;
    x: number;
    y: number;
  } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 300);
    return () => clearTimeout(t);
  }, []);

  const modelData = useMemo(() => {
    const result: { model: string; points: MoodPoint[]; path: string }[] = [];
    for (const a of analyses) {
      const points = extractTimeline(a.rawResponse);
      if (points) {
        result.push({
          model: a.model,
          points,
          path: catmullRomPath(points),
        });
      }
    }
    return result;
  }, [analyses]);

  const handlePointInteraction = useCallback(
    (model: string, point: MoodPoint, e: React.MouseEvent | React.TouchEvent) => {
      e.stopPropagation();

      // Toggle on tap/click
      if (
        tooltip &&
        tooltip.model === model &&
        tooltip.point.position === point.position
      ) {
        setTooltip(null);
        return;
      }

      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const [sx, sy] = toSVG(point.position, point.valence);
      const scaleX = rect.width / W;
      const scaleY = rect.height / H;
      setTooltip({
        model,
        point,
        x: rect.left + sx * scaleX,
        y: rect.top + sy * scaleY,
      });
    },
    [tooltip]
  );

  const dismissTooltip = useCallback(() => setTooltip(null), []);

  // Reposition tooltip on scroll
  useEffect(() => {
    if (!tooltip) return;
    const update = () => {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const [sx, sy] = toSVG(tooltip.point.position, tooltip.point.valence);
      const scaleX = rect.width / W;
      const scaleY = rect.height / H;
      setTooltip((prev) =>
        prev
          ? { ...prev, x: rect.left + sx * scaleX, y: rect.top + sy * scaleY }
          : null
      );
    };
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [tooltip]);

  if (modelData.length === 0) return null;

  const midY = toSVG(0, 0)[1];
  const guideTopY = toSVG(0, 0.5)[1];
  const guideBotY = toSVG(0, -0.5)[1];

  return (
    <div
      className="relative"
      onClick={dismissTooltip}
      style={{
        opacity: entered ? 1 : 0,
        transform: entered ? "translateY(0)" : "translateY(8px)",
        transition: "opacity 1s ease-out, transform 1s ease-out",
      }}
    >
      {/* Heading */}
      <p className="text-xs text-charcoal-light/50 font-[family-name:var(--font-ui)] tracking-widest uppercase mb-3">
        Emotional Journey
      </p>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ overflow: "visible" }}
      >
        {/* Guide lines */}
        <line
          x1={PAD_L}
          y1={midY}
          x2={W - PAD_R}
          y2={midY}
          stroke="currentColor"
          className="text-charcoal-light/15"
          strokeDasharray="6 4"
          strokeWidth="1"
        />
        <line
          x1={PAD_L}
          y1={guideTopY}
          x2={W - PAD_R}
          y2={guideTopY}
          stroke="currentColor"
          className="text-charcoal-light/8"
          strokeDasharray="3 6"
          strokeWidth="0.5"
        />
        <line
          x1={PAD_L}
          y1={guideBotY}
          x2={W - PAD_R}
          y2={guideBotY}
          stroke="currentColor"
          className="text-charcoal-light/8"
          strokeDasharray="3 6"
          strokeWidth="0.5"
        />

        {/* Y-axis labels */}
        <text
          x={PAD_L - 12}
          y={PAD_T + 10}
          textAnchor="middle"
          className="text-charcoal-light/30"
          fontSize="14"
          fontFamily="var(--font-ui)"
        >
          +
        </text>
        <text
          x={PAD_L - 12}
          y={PAD_T + CHART_H - 2}
          textAnchor="middle"
          className="text-charcoal-light/30"
          fontSize="16"
          fontFamily="var(--font-ui)"
        >
          −
        </text>

        {/* Curves */}
        {modelData.map(({ model, path }) => (
          <path
            key={model}
            d={path}
            fill="none"
            stroke={MODEL_COLORS[model]}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mood-curve"
            style={{
              opacity:
                hoveredModel === null || hoveredModel === model ? 1 : 0.2,
              transition: "opacity 0.3s ease",
            }}
            onMouseEnter={() => setHoveredModel(model)}
            onMouseLeave={() => setHoveredModel(null)}
          />
        ))}

        {/* Points */}
        {modelData.map(({ model, points }) =>
          points.map((p, i) => {
            const [cx, cy] = toSVG(p.position, p.valence);
            const isActive =
              tooltip?.model === model &&
              tooltip?.point.position === p.position;
            return (
              <g key={`${model}-${i}`}>
                {/* Invisible larger hit target */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={14}
                  fill="transparent"
                  className="mood-point-target"
                  onClick={(e) => handlePointInteraction(model, p, e)}
                  onMouseEnter={() => setHoveredModel(model)}
                  onMouseLeave={() => setHoveredModel(null)}
                />
                {/* Visible dot */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isActive ? 5 : 3.5}
                  fill={MODEL_COLORS[model]}
                  stroke="var(--color-ivory)"
                  strokeWidth="1.5"
                  style={{
                    opacity:
                      hoveredModel === null || hoveredModel === model
                        ? 1
                        : 0.2,
                    transition: "opacity 0.3s ease, r 0.2s ease",
                  }}
                  className="pointer-events-none"
                />
              </g>
            );
          })
        )}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-2 justify-center">
        {modelData.map(({ model }) => (
          <div
            key={model}
            className="flex items-center gap-1.5"
            onMouseEnter={() => setHoveredModel(model)}
            onMouseLeave={() => setHoveredModel(null)}
          >
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: MODEL_COLORS[model] }}
            />
            <span className="text-[11px] text-charcoal-light/60 font-[family-name:var(--font-ui)]">
              {MODEL_LABELS[model]}
            </span>
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 max-w-xs px-4 py-3 bg-charcoal text-white text-sm rounded-lg shadow-lg"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y - 10}px`,
            transform: "translate(-50%, -100%)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <p className="font-medium text-xs" style={{ color: MODEL_COLORS[tooltip.model] }}>
            {MODEL_LABELS[tooltip.model]}
          </p>
          <p className="font-medium mt-0.5">{tooltip.point.mood}</p>
          <p className="text-white/70 text-xs mt-0.5">{tooltip.point.label}</p>
          <div
            className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-charcoal"
          />
        </div>
      )}
    </div>
  );
}
