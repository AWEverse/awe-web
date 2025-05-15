import { clamp, isBetween } from "@/lib/core";
import type {
  MarkdownOutput,
  MarkdownOutputDiagnostics,
  MarkdownOutputEntity,
} from "./markdownInput.types";

/**
 * Zips entities and html into a MarkdownOutput object with enhanced diagnostics.
 */
export function zipMarkdownOutput(
  entities: MarkdownOutputEntity[],
  html: string,
  input: string,
  stages: MarkdownOutputDiagnostics["stages"],
  warnings: string[] = [],
): MarkdownOutput {
  return {
    entities: normalizeMarkdownEntities(entities),
    html,
    diagnostics: generateDiagnostics(input, entities, stages, warnings),
  };
}

/**
 * Normalize MarkdownOutputEntity array:
 * - Removes empty text entries
 * - Normalizes color fields to hex/rgba
 * - Validates and converts font sizes to pixels
 * - Validates entity-specific metadata
 * - Enforces proper entity types
 */
export function normalizeMarkdownEntities(
  entities: MarkdownOutputEntity[],
): MarkdownOutputEntity[] {
  return entities
    .filter((e) => e.text.trim().length > 0)
    .map((e) => ({
      ...e,
      color: e.color ? normalizeColor(e.color) : undefined,
      backgroundColor: e.backgroundColor
        ? normalizeColor(e.backgroundColor)
        : undefined,
      fontSize: normalizeFontSize(e.fontSize),
      metadata: validateEntityMetadata(e),
    }));
}

/**
 * Join all text fragments into a single string.
 */
export function flattenMarkdownText(entities: MarkdownOutputEntity[]): string {
  return entities.map((e) => e.text).join("");
}

/**
 * Groups entities by their markdownEntity type.
 */
export function groupByMarkdownEntity(
  entities: MarkdownOutputEntity[],
): Record<string, MarkdownOutputEntity[]> {
  return entities.reduce(
    (acc, entity) => {
      const key = entity.markdownEntity || "plain";
      if (!acc[key]) acc[key] = [];
      acc[key].push(entity);
      return acc;
    },
    {} as Record<string, MarkdownOutputEntity[]>,
  );
}

/**
 * Converts any supported color format to a normalized hex or rgba string.
 * Supports: hex, rgb, rgba, hsl, hsla, and named colors.
 */
function normalizeColor(color: string): string {
  if (/^#[0-9a-f]{6}$/i.test(color)) return color.toLowerCase();
  if (/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[\d.]+\s*)?\)$/.test(color))
    return color.toLowerCase();

  const rgbMatch = color.match(
    /^rgb(?:a)?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/i,
  );

  if (rgbMatch) {
    const [, r, g, b, a] = rgbMatch;

    return a
      ? `rgba(${r}, ${g}, ${b}, ${a})`
      : rgbToHex(Number(r), Number(g), Number(b));
  }

  const hslMatch = color.match(
    /^hsl(?:a)?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*([\d.]+)\s*)?\)$/i,
  );

  if (hslMatch) {
    const [, h, s, l, a] = hslMatch;
    const [r, g, b] = hslToRgb(Number(h), Number(s), Number(l));
    return a ? `rgba(${r}, ${g}, ${b}, ${a})` : rgbToHex(r, g, b);
  }

  const colorMap: Record<string, string> = {
    // Standard colors
    black: "#000000",
    white: "#ffffff",
    red: "#ff0000",
    green: "#00ff00",
    blue: "#0000ff",
    yellow: "#ffff00",
    // Additional common colors
    purple: "#800080",
    orange: "#ffa500",
    gray: "#808080",
    pink: "#ffc0cb",
    brown: "#a52a2a",
    cyan: "#00ffff",
    magenta: "#ff00ff",
    lime: "#00ff00",
    indigo: "#4b0082",
    violet: "#ee82ee",
    maroon: "#800000",
    navy: "#000080",
    olive: "#808000",
    teal: "#008080",
    // Material design colors
    primary: "#1976d2",
    secondary: "#dc004e",
    error: "#f44336",
    warning: "#ff9800",
    info: "#2196f3",
    success: "#4caf50",
  };

  return colorMap[color.toLowerCase()] || color.toLowerCase();
}

/**
 * Converts RGB values to hex color string.
 */
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => clamp(n, 0, 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Converts HSL values to RGB values.
 */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360;
  s /= 100;
  l /= 100;

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * Type for supported font size units
 */
type FontSizeUnit = "px" | "rem" | "em";

interface FontSizeConfig {
  minSize: number; // in pixels
  maxSize: number; // in pixels
  defaultUnit: FontSizeUnit;
  basePixelSize: number; // base pixel size for rem conversion
}

const fontSizeConfig: FontSizeConfig = {
  minSize: 8,
  maxSize: 72,
  defaultUnit: "px",
  basePixelSize: 16,
};

/**
 * Normalize and validate font size with unit support.
 * Returns pixel size as number or undefined if invalid.
 */
function normalizeFontSize(
  size: string | number | undefined,
): number | undefined {
  if (size === undefined) return undefined;

  if (typeof size === "number") {
    return validateFontSizeInPixels(size);
  }

  const match = String(size).match(/^([\d.]+)(px|rem|em)?$/);
  if (!match) return undefined;

  const [, value, unit = fontSizeConfig.defaultUnit] = match;
  const numValue = parseFloat(value);

  let pixelValue: number;
  switch (unit) {
    case "rem":
    case "em":
      pixelValue = numValue * fontSizeConfig.basePixelSize;
      break;
    case "px":
      pixelValue = numValue;
      break;
    default:
      return undefined;
  }

  return validateFontSizeInPixels(pixelValue);
}

/**
 * Validate font size is within bounds
 */
function validateFontSizeInPixels(size: number): number | undefined {
  if (isNaN(size)) return undefined;
  if (!isBetween(size, fontSizeConfig.minSize, fontSizeConfig.maxSize))
    return undefined;
  return Math.round(size);
}


/**
 * Generate diagnostics for markdown processing
 */
function generateDiagnostics(
  input: string,
  entities: MarkdownOutputEntity[],
  stages: MarkdownOutputDiagnostics["stages"],
  warnings: string[] = [],
): MarkdownOutputDiagnostics {
  const characterCount = input.length;
  const wordCount = input.trim().split(/\s+/).length;
  const entityCount = entities.length;

  const timeMs = stages.htmlEnd - stages.parseStart;

  return {
    timeMs,
    characterCount,
    wordCount,
    entityCount,
    stages,
    warnings,
    metrics: {
      avgTimePerEntity: entityCount ? timeMs / entityCount : 0,
      avgCharsPerEntity: entityCount ? characterCount / entityCount : 0,
    },
  };
}

/**
 * Validates and normalizes entity-specific metadata
 */
function validateEntityMetadata(
  entity: MarkdownOutputEntity,
): MarkdownOutputEntity["metadata"] {
  const { markdownEntity, metadata } = entity;
  if (!metadata) return undefined;

  switch (markdownEntity) {
    case "heading":
      if (metadata.level && isBetween(metadata.level, 1, 6)) {
        return { ...metadata, level: clamp(metadata.level, 1, 6) };
      }
      break;

    case "link":
    case "image":
      if (metadata.url && !isValidUrl(metadata.url)) return undefined;
      if (
        markdownEntity === "image" &&
        metadata.src &&
        !isValidUrl(metadata.src)
      )
        return undefined;
      break;

    case "list":
      if (
        metadata.listType &&
        !["ordered", "unordered"].includes(metadata.listType)
      ) {
        return { ...metadata, listType: "unordered" };
      }
      break;

    case "code":
      if (metadata.language) {
        return { ...metadata, language: metadata.language.toLowerCase() };
      }
      break;

    case "table":
      if (Array.isArray(metadata.align)) {
        const validAlignments = metadata.align.map((a) =>
          ["left", "center", "right"].includes(a) ? a : "left",
        );
        return { ...metadata, align: validAlignments };
      }
      break;
  }

  return metadata;
}

/**
 * Validate URL string
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
