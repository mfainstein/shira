export interface DrawCommand {
  type:
    | "moveTo"
    | "lineTo"
    | "arc"
    | "quadraticCurveTo"
    | "bezierCurveTo"
    | "closePath";
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

export interface IllustrationPath {
  commands: DrawCommand[];
  stroke?: boolean;
  fill?: boolean;
  lineWidth?: number;
}

export interface IllustrationData {
  paths: IllustrationPath[];
}

export interface ArtGenerationResult {
  imageData: Buffer;
  drawCommands?: IllustrationData;
  prompt: string;
  style: "MINIMALIST" | "DALLE";
}
