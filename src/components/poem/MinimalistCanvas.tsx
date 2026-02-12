"use client";

import { useRef, useEffect } from "react";

interface DrawCommand {
  type: string;
  x?: number;
  y?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  radius?: number;
  startAngle?: number;
  endAngle?: number;
}

interface IllustrationPath {
  commands: DrawCommand[];
  stroke?: boolean;
  fill?: boolean;
  lineWidth?: number;
}

interface MinimalistCanvasProps {
  drawCommands: { paths: Array<Record<string, unknown>> };
  width: number;
  height: number;
  title: string;
}

export function MinimalistCanvas({
  drawCommands,
  width,
  height,
  title,
}: MinimalistCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = canvas.clientWidth;
    const displayHeight = (displayWidth / width) * height;

    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    canvas.style.height = `${displayHeight}px`;
    ctx.scale(dpr, dpr);

    // Background
    ctx.fillStyle = "#faf8f5";
    ctx.fillRect(0, 0, displayWidth, displayHeight);

    // Border
    ctx.strokeStyle = "#d4c5b0";
    ctx.lineWidth = 1;
    const padding = 15;
    ctx.strokeRect(padding, padding, displayWidth - padding * 2, displayHeight - padding * 2);

    // Scale drawing commands to fit canvas
    const scaleX = displayWidth / width;
    const scaleY = displayHeight / height;
    const scale = Math.min(scaleX, scaleY);

    const offsetX = (displayWidth - width * scale) / 2;
    const offsetY = (displayHeight - height * scale) / 2;

    ctx.strokeStyle = "#2c2c2c";
    ctx.fillStyle = "#2c2c2c";

    const paths = drawCommands.paths as unknown as IllustrationPath[];
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
  }, [drawCommands, width, height]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full rounded-lg"
      style={{ aspectRatio: `${width}/${height}` }}
      aria-label={`Minimalist artwork for ${title}`}
    />
  );
}
