import { createCanvas, CanvasRenderingContext2D } from "canvas";
import { claude } from "@/lib/llm";
import {
  DrawCommand,
  IllustrationPath,
  IllustrationData,
  ArtGenerationResult,
} from "./types";

function executeDrawCommands(
  ctx: CanvasRenderingContext2D,
  paths: IllustrationPath[],
  offsetX: number,
  offsetY: number,
  scale: number
): void {
  for (const path of paths) {
    ctx.beginPath();
    ctx.lineWidth = (path.lineWidth || 2) * scale;

    for (const cmd of path.commands) {
      const x = (cmd.x || 0) * scale + offsetX;
      const y = (cmd.y || 0) * scale + offsetY;

      switch (cmd.type) {
        case "moveTo":
          ctx.moveTo(x, y);
          break;
        case "lineTo":
          ctx.lineTo(x, y);
          break;
        case "arc":
          ctx.arc(
            x,
            y,
            (cmd.radius || 10) * scale,
            cmd.startAngle || 0,
            cmd.endAngle || Math.PI * 2
          );
          break;
        case "quadraticCurveTo":
          ctx.quadraticCurveTo(
            (cmd.x1 || 0) * scale + offsetX,
            (cmd.y1 || 0) * scale + offsetY,
            x,
            y
          );
          break;
        case "bezierCurveTo":
          ctx.bezierCurveTo(
            (cmd.x1 || 0) * scale + offsetX,
            (cmd.y1 || 0) * scale + offsetY,
            (cmd.x2 || 0) * scale + offsetX,
            (cmd.y2 || 0) * scale + offsetY,
            x,
            y
          );
          break;
        case "closePath":
          ctx.closePath();
          break;
      }
    }

    if (path.fill) {
      ctx.fill();
    }
    if (path.stroke !== false) {
      ctx.stroke();
    }
  }
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
  const canvas = createCanvas(1200, 800);
  const ctx = canvas.getContext("2d");

  // Warm ivory background
  ctx.fillStyle = "#faf8f5";
  ctx.fillRect(0, 0, 1200, 800);

  // Subtle border
  ctx.strokeStyle = "#d4c5b0";
  ctx.lineWidth = 2;
  ctx.strokeRect(30, 30, 1140, 740);

  // Generate illustration
  const illustration = await generateIllustration(title, content, themes);

  // Draw the illustration centered
  ctx.strokeStyle = "#2c2c2c";
  ctx.fillStyle = "#2c2c2c";

  const scale = 1.5;
  const offsetX = (1200 - 400 * scale) / 2;
  const offsetY = (800 - 500 * scale) / 2;

  executeDrawCommands(ctx, illustration.paths, offsetX, offsetY, scale);

  const prompt = `Minimalist pen-and-ink illustration for poem "${title}" with themes: ${themes.join(", ")}`;

  return {
    imageData: canvas.toBuffer("image/png"),
    drawCommands: illustration,
    prompt,
    style: "MINIMALIST",
  };
}
