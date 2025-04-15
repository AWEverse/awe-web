
import { PathSyntaxError } from "./PathSyntaxError";
import { isValidIdentifier, isTemplate } from "./PathSyntaxValidators";

export type PathToken = "*" | "**" | "[]" | string;
export type PathSegment = string | number;
export type MatchTrace = {
  pattern: string;
  matched: boolean;
  params?: Record<string, string>;
};

// Cache with size limit to prevent uncontrolled growth
const MAX_CACHE_SIZE = 1000;
const parseCache = new Map<string, PathToken[]>();

function parsePathPattern(input: string): PathToken[] {
  if (!input) throw new PathSyntaxError("<empty>", 0);

  const cached = parseCache.get(input);
  if (cached) return cached;

  const segments = input.split(".");
  const tokens = segments.map((seg, i) => {
    if (seg === "*" || seg === "**" || seg === "[]") return seg;
    if (isValidIdentifier(seg) || isTemplate(seg)) return seg;
    throw new PathSyntaxError(seg, i);
  });

  // Evict oldest entry if cache is full
  if (parseCache.size >= MAX_CACHE_SIZE) {
    const firstKey = parseCache.keys().next().value;
    if (firstKey !== undefined) {
      parseCache.delete(firstKey);
    }
  }
  parseCache.set(input, tokens);
  return tokens;
}

function matchSegment(
  pattern: PathToken,
  actual: PathSegment,
  params: Record<string, string>,
): boolean {
  if (pattern === "*") return typeof actual === "string";
  if (pattern === "[]") return typeof actual === "number";
  if (pattern[0] === ":") {
    params[pattern.slice(1)] = String(actual);
    return true;
  }
  return pattern === String(actual);
}

interface CompiledPattern {
  raw: PathToken[];
  prefixLen: number;
  suffixLen: number;
  hasDeep: boolean;
}

function compilePattern(pattern: PathToken[]): CompiledPattern {
  const firstDeep = pattern.indexOf("**");
  return {
    raw: pattern,
    prefixLen: firstDeep === -1 ? pattern.length : firstDeep,
    suffixLen: firstDeep === -1 ? 0 : pattern.length - firstDeep - 1,
    hasDeep: firstDeep !== -1,
  };
}

function matchCompiledPath(
  path: PathSegment[],
  compiled: CompiledPattern,
  params: Record<string, string>,
): boolean {
  const { raw, prefixLen, suffixLen, hasDeep } = compiled;

  if (!hasDeep && path.length !== raw.length) return false;
  if (hasDeep && path.length < prefixLen + suffixLen) return false;

  for (let i = 0; i < prefixLen; i++) {
    if (!matchSegment(raw[i], path[i], params)) return false;
  }

  if (hasDeep) {
    for (let i = 0; i < suffixLen; i++) {
      if (
        !matchSegment(
          raw[raw.length - suffixLen + i],
          path[path.length - suffixLen + i],
          params,
        )
      )
        return false;
    }
  }

  return true;
}

export function createPathMatcherWithTrace(
  patterns: string[],
): (path: PathSegment[]) => MatchTrace[] {
  const compiled = patterns.map((p) => ({
    pattern: compilePattern(parsePathPattern(p)),
    original: p,
  }));

  return (path: PathSegment[]) =>
    compiled.map(({ pattern, original }) => {
      const params: Record<string, string> = {};
      const matched = matchCompiledPath(path, pattern, params);
      return {
        pattern: original,
        matched,
        params: matched ? params : undefined,
      };
    });
}

export function createPathMatcher(
  patterns: string[],
): (path: PathSegment[]) => boolean {
  const compiled = patterns.map((p) => compilePattern(parsePathPattern(p)));
  return (path: PathSegment[]) =>
    compiled.some((cp) => matchCompiledPath(path, cp, {}));
}
