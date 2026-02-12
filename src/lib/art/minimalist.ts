import sharp from "sharp";
import { claude } from "@/lib/llm";
import {
  DrawCommand,
  IllustrationPath,
  IllustrationData,
  ArtGenerationResult,
} from "./types";

function commandsToSVGPath(commands: DrawCommand[]): string {
  const parts: string[] = [];

  for (const cmd of commands) {
    const x = cmd.x || 0;
    const y = cmd.y || 0;

    switch (cmd.type) {
      case "moveTo":
        parts.push(`M ${x} ${y}`);
        break;
      case "lineTo":
        parts.push(`L ${x} ${y}`);
        break;
      case "quadraticCurveTo":
        parts.push(`Q ${cmd.x1 || 0} ${cmd.y1 || 0} ${x} ${y}`);
        break;
      case "bezierCurveTo":
        parts.push(
          `C ${cmd.x1 || 0} ${cmd.y1 || 0} ${cmd.x2 || 0} ${cmd.y2 || 0} ${x} ${y}`
        );
        break;
      case "closePath":
        parts.push("Z");
        break;
      case "arc": {
        // Convert arc to SVG arc commands
        const radius = cmd.radius || 10;
        const startAngle = cmd.startAngle || 0;
        const endAngle = cmd.endAngle || Math.PI * 2;
        const isFullCircle = Math.abs(endAngle - startAngle) >= Math.PI * 2 - 0.01;

        if (isFullCircle) {
          // Full circle: two half-arcs
          parts.push(
            `M ${x + radius} ${y}`,
            `A ${radius} ${radius} 0 1 1 ${x - radius} ${y}`,
            `A ${radius} ${radius} 0 1 1 ${x + radius} ${y}`,
            "Z"
          );
        } else {
          const sx = x + radius * Math.cos(startAngle);
          const sy = y + radius * Math.sin(startAngle);
          const ex = x + radius * Math.cos(endAngle);
          const ey = y + radius * Math.sin(endAngle);
          const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
          parts.push(
            `M ${sx} ${sy}`,
            `A ${radius} ${radius} 0 ${largeArc} 1 ${ex} ${ey}`
          );
        }
        break;
      }
    }
  }

  return parts.join(" ");
}

function illustrationToSVG(
  illustration: IllustrationData,
  width: number,
  height: number,
  viewBoxWidth: number,
  viewBoxHeight: number,
  offsetX: number,
  offsetY: number,
  scale: number
): string {
  const pathElements: string[] = [];

  for (const path of illustration.paths) {
    // Scale and offset commands
    const scaledCommands: DrawCommand[] = path.commands.map((cmd) => {
      const scaled: DrawCommand = { ...cmd };
      if (scaled.x !== undefined) scaled.x = scaled.x * scale + offsetX;
      if (scaled.y !== undefined) scaled.y = scaled.y * scale + offsetY;
      if (scaled.x1 !== undefined) scaled.x1 = scaled.x1 * scale + offsetX;
      if (scaled.y1 !== undefined) scaled.y1 = scaled.y1 * scale + offsetY;
      if (scaled.x2 !== undefined) scaled.x2 = scaled.x2 * scale + offsetX;
      if (scaled.y2 !== undefined) scaled.y2 = scaled.y2 * scale + offsetY;
      if (scaled.radius !== undefined) scaled.radius = scaled.radius * scale;
      return scaled;
    });

    const d = commandsToSVGPath(scaledCommands);
    const strokeWidth = (path.lineWidth || 2) * scale;
    const fill = path.fill ? "#2c2c2c" : "none";
    const stroke = path.stroke !== false ? "#2c2c2c" : "none";

    pathElements.push(
      `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>`
    );
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${viewBoxWidth} ${viewBoxHeight}">
  <rect width="${viewBoxWidth}" height="${viewBoxHeight}" fill="#faf8f5"/>
  <rect x="30" y="30" width="${viewBoxWidth - 60}" height="${viewBoxHeight - 60}" fill="none" stroke="#d4c5b0" stroke-width="2"/>
  ${pathElements.join("\n  ")}
</svg>`;
}

function getDefaultIllustration(): IllustrationData {
  return {
    paths: [
      // Quill pen
      {
        commands: [
          { type: "moveTo", x: 200, y: 50 },
          { type: "quadraticCurveTo", x1: 210, y1: 150, x: 180, y: 350 },
          { type: "lineTo", x: 175, y: 360 },
          { type: "lineTo", x: 170, y: 350 },
          { type: "quadraticCurveTo", x1: 190, y1: 150, x: 200, y: 50 },
        ],
        stroke: true,
        lineWidth: 2,
      },
      // Feather barbs left
      ...Array.from({ length: 8 }, (_, i) => ({
        commands: [
          {
            type: "moveTo" as const,
            x: 195 - i * 2,
            y: 80 + i * 30,
          },
          {
            type: "quadraticCurveTo" as const,
            x1: 150 - i * 5,
            y1: 70 + i * 30,
            x: 120 - i * 3,
            y: 90 + i * 30,
          },
        ],
        stroke: true,
        lineWidth: 1,
      })),
      // Feather barbs right
      ...Array.from({ length: 8 }, (_, i) => ({
        commands: [
          {
            type: "moveTo" as const,
            x: 205 + i * 2,
            y: 80 + i * 30,
          },
          {
            type: "quadraticCurveTo" as const,
            x1: 250 + i * 5,
            y1: 70 + i * 30,
            x: 280 + i * 3,
            y: 90 + i * 30,
          },
        ],
        stroke: true,
        lineWidth: 1,
      })),
      // Ink drops
      {
        commands: [{ type: "arc", x: 178, y: 370, radius: 5 }],
        stroke: true,
        fill: true,
        lineWidth: 1,
      },
      {
        commands: [{ type: "arc", x: 185, y: 385, radius: 3 }],
        stroke: true,
        fill: true,
        lineWidth: 1,
      },
      // Decorative line below
      {
        commands: [
          { type: "moveTo", x: 80, y: 420 },
          { type: "quadraticCurveTo", x1: 200, y1: 400, x: 320, y: 420 },
        ],
        stroke: true,
        lineWidth: 1,
      },
    ],
  };
}

async function generateIllustration(
  title: string,
  content: string,
  themes: string[]
): Promise<IllustrationData> {
  const prompt = `You are an illustrator creating a minimalist pen-and-ink style illustration for a poem. Based on the poem below, create a detailed line drawing that represents its main theme or mood.

Title: ${title}
Themes: ${themes.join(", ")}
First lines: ${content.substring(0, 200)}

Generate drawing commands for a minimalist, e-ink style illustration. The canvas is 400x500 units. Create something evocative and related to the poem's themes - like a natural scene, symbolic object, or abstract pattern.

Respond ONLY with valid JSON in this exact format (no other text):
{
  "paths": [
    {
      "commands": [
        {"type": "moveTo", "x": 100, "y": 100},
        {"type": "lineTo", "x": 200, "y": 100},
        {"type": "closePath"}
      ],
      "stroke": true,
      "fill": false,
      "lineWidth": 2
    }
  ]
}

Available command types:
- moveTo: {type: "moveTo", x, y}
- lineTo: {type: "lineTo", x, y}
- arc: {type: "arc", x, y, radius, startAngle, endAngle} (angles in radians)
- quadraticCurveTo: {type: "quadraticCurveTo", x1, y1, x, y}
- bezierCurveTo: {type: "bezierCurveTo", x1, y1, x2, y2, x, y}
- closePath: {type: "closePath"}

Create 15-30 paths for a detailed illustration. Use lineWidth 1-3.`;

  try {
    const response = await claude.generate(prompt, {
      temperature: 0.8,
      maxTokens: 4000,
    });

    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]) as IllustrationData;
      if (data.paths && data.paths.length > 0) {
        return data;
      }
    }
    throw new Error("Invalid illustration data");
  } catch (error) {
    console.error("Error generating illustration:", error);
    return getDefaultIllustration();
  }
}

export async function createMinimalistArt(
  title: string,
  content: string,
  themes: string[]
): Promise<ArtGenerationResult> {
  const width = 1200;
  const height = 800;

  // Generate illustration
  const illustration = await generateIllustration(title, content, themes);

  // Scale and center the illustration on the canvas
  const scale = 1.5;
  const offsetX = (width - 400 * scale) / 2;
  const offsetY = (height - 500 * scale) / 2;

  const svg = illustrationToSVG(
    illustration,
    width,
    height,
    width,
    height,
    offsetX,
    offsetY,
    scale
  );

  // Convert SVG to PNG via Sharp
  const imageData = await sharp(Buffer.from(svg))
    .png()
    .toBuffer();

  const artPrompt = `Minimalist pen-and-ink illustration for poem "${title}" with themes: ${themes.join(", ")}`;

  return {
    imageData,
    drawCommands: illustration,
    prompt: artPrompt,
    style: "MINIMALIST",
  };
}
