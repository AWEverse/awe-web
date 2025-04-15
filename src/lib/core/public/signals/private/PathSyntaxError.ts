/**
 * Structured tip for fixing an invalid segment.
 */
interface FixTip {
  /** Description of the issue and how to fix it */
  message: string;
  /** Category of the issue (e.g., "syntax", "wildcard") */
  category: string;
  /** Optional example of correct usage */
  example?: string;
}

/**
 * Error thrown when a path pattern contains invalid segments, with structured tips to fix the issue.
 */
export class PathSyntaxError extends Error {
  constructor(segment: string, index: number) {
    super(`Invalid path segment "${segment}" at index ${index}`);
    this.name = "PathSyntaxError";
    this.segment = segment;
    this.index = index;
  }

  readonly segment: string;
  readonly index: number;

  /**
   * Generates structured tips to help fix the invalid segment.
   * @returns Array of structured suggestions for correction.
   */
  getFixTips(): FixTip[] {
    const tips: FixTip[] = [];
    const seg = this.segment;

    if (!seg) {
      tips.push({
        message: "Segment cannot be empty.",
        category: "syntax",
        example: "user, *, :param",
      });
      return tips;
    }

    if (/[^a-zA-Z0-9_$:[\]*]/.test(seg)) {
      const sanitized = seg.replace(/[^a-zA-Z0-9_$]/g, "");
      tips.push({
        message: "Segment contains invalid characters.",
        category: "syntax",
        example: `user_${sanitized || "id"}`,
      });
    }

    if (!/^[a-zA-Z_$:*[]]/.test(seg)) {
      tips.push({
        message:
          "Segment must start with a letter, '_', '$', ':', '*', or '[]'.",
        category: "syntax",
        example: "user, :param",
      });
    }

    if (seg === "*" || seg === "**" || seg === "[]") {
      tips.push({
        message: `The '${seg}' wildcard must be used alone.`,
        category: "wildcard",
        example: seg,
      });
    } else if (seg.includes("*") && seg !== "*" && seg !== "**") {
      tips.push({
        message: "Wildcards '*' and '**' must be standalone segments.",
        category: "wildcard",
        example: "user.*.name, user.**",
      });
    }

    if (seg.startsWith(":")) {
      if (!/^:[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(seg)) {
        tips.push({
          message:
            "Parameters must follow ':name' format with valid identifier characters.",
          category: "parameter",
          example: ":userId",
        });
      }
    } else if (seg.includes(":")) {
      tips.push({
        message: "Colon ':' is only allowed at the start for parameters.",
        category: "parameter",
        example: ":param",
      });
    }

    if (seg.includes("[") || seg.includes("]")) {
      if (seg !== "[]") {
        tips.push({
          message: "Array wildcard must be exactly '[]'.",
          category: "wildcard",
          example: "items.[].name",
        });
      }
    }

    if (/^\d/.test(seg)) {
      tips.push({
        message: "Identifiers cannot start with a digit unless purely numeric.",
        category: "syntax",
        example: "123, user123",
      });
    }

    if (tips.length === 0) {
      tips.push({
        message: "Segment must be a valid identifier, parameter, or wildcard.",
        category: "general",
        example: "user, :id, *",
      });
    }

    return tips;
  }

  /**
   * Formats tips as a readable string.
   * @param separator - String to join tips (default: newline).
   * @returns Formatted string of all tips.
   */
  formatTips(separator: string = "\n"): string {
    return this.getFixTips()
      .map((tip) => {
        const parts = [tip.message];
        if (tip.example) parts.push(`Example: ${tip.example}`);
        return parts.join(" ");
      })
      .join(separator);
  }
}
