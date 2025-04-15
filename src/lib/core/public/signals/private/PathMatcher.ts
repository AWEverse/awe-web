import { PathSyntaxError } from "./PathSyntaxError";
import { isValidIdentifier, isTemplate } from "./PathSyntaxValidators";

export type PathToken = "*" | "**" | "[]" | string;
export type PathSegment = string | number;
export type MatchTrace = {
  pattern: string;
  matched: boolean;
  params?: Record<string, string>;
};

const MAX_CACHE_SIZE = 1000;
const TOKEN_STAR = "*";
const TOKEN_DEEP = "**";
const TOKEN_ARRAY = "[]";

// Low-level cache with bounded size
const parseCache = new Map<string, PathToken[]>();

/**
 * Parses a path pattern into tokens with minimal allocations.
 * @param input - Pattern string (e.g., "user.*.name").
 * @returns Array of tokens.
 * @throws PathSyntaxError for invalid patterns.
 */
function parsePathPattern(input: string): PathToken[] {
  if (!input) throw new PathSyntaxError("<empty>", 0);

  const cached = parseCache.get(input);
  if (cached) return cached;

  const tokens: PathToken[] = [];
  let start = 0;
  let i = 0;

  // Manual splitting to avoid array allocation
  while (i <= input.length) {
    if (i === input.length || input[i] === ".") {
      const seg = input.slice(start, i);
      if (!seg) throw new PathSyntaxError("<empty>", tokens.length);

      if (seg === TOKEN_STAR || seg === TOKEN_DEEP || seg === TOKEN_ARRAY) {
        tokens.push(seg);
      } else if (isValidIdentifier(seg) || isTemplate(seg)) {
        tokens.push(seg);
      } else {
        throw new PathSyntaxError(seg, tokens.length);
      }

      start = i + 1;
    }
    i++;
  }

  // Cache with eviction
  if (parseCache.size >= MAX_CACHE_SIZE) {
    const firstKey = parseCache.keys().next().value as string | undefined;
    if (firstKey) parseCache.delete(firstKey);
  }
  parseCache.set(input, tokens);
  return tokens;
}

/**
 * Matches a single token against a path segment.
 * @param pattern - Token to match.
 * @param actual - Path segment.
 * @param params - Object to store parameters.
 * @returns True if matched, false otherwise.
 */
function matchSegment(
  pattern: PathToken,
  actual: PathSegment,
  params: Record<string, string>,
): boolean {
  if (pattern === TOKEN_STAR) return typeof actual === "string";
  if (pattern === TOKEN_ARRAY) return typeof actual === "number";
  if ((pattern as string)[0] === ":") {
    params[pattern.slice(1)] = String(actual);
    return true;
  }
  return pattern === (typeof actual === "string" ? actual : String(actual));
}

/**
 * Compiled pattern for efficient matching.
 */
interface CompiledPattern {
  tokens: PathToken[];
  prefixLen: number;
  suffixLen: number;
  hasDeep: boolean;
}

/**
 * Compiles tokens into a pattern with precomputed metadata.
 * @param tokens - Array of tokens.
 * @returns Compiled pattern.
 */
function compilePattern(tokens: PathToken[]): CompiledPattern {
  let firstDeep = -1;

  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i] === TOKEN_DEEP) {
      firstDeep = i;
      break;
    }
  }

  return {
    tokens,
    prefixLen: firstDeep === -1 ? tokens.length : firstDeep,
    suffixLen: firstDeep === -1 ? 0 : tokens.length - firstDeep - 1,
    hasDeep: firstDeep !== -1,
  };
}

/**
 * Matches a path against a compiled pattern with minimal allocations.
 * @param path - Path segments to match.
 * @param compiled - Compiled pattern.
 * @param params - Object to store parameters.
 * @returns True if matched, false otherwise.
 */
function matchCompiledPath(
  path: PathSegment[],
  compiled: CompiledPattern,
  params: Record<string, string>,
): boolean {
  const { tokens, prefixLen, suffixLen, hasDeep } = compiled;
  const pathLen = path.length;

  if (!hasDeep && pathLen !== tokens.length) return false;
  if (hasDeep && pathLen < prefixLen + suffixLen) return false;

  for (let i = 0; i < prefixLen; i++) {
    if (!matchSegment(tokens[i], path[i], params)) return false;
  }

  if (hasDeep) {
    for (let i = 0; i < suffixLen; i++) {
      if (
        !matchSegment(
          tokens[tokens.length - suffixLen + i],
          path[pathLen - suffixLen + i],
          params,
        )
      )
        return false;
    }
  }

  return true;
}

/**
 * Creates a matcher with trace output for debugging.
 * @param patterns - Array of pattern strings.
 * @returns Function returning trace results for a path.
 */
export function createPathMatcherWithTrace(
  patterns: string[],
): (path: PathSegment[]) => MatchTrace[] {
  const compiled = patterns.map((p) => ({
    pattern: compilePattern(parsePathPattern(p)),
    original: p,
  }));

  const paramsPool: Record<string, string> = {}; // Reuse params object to reduce allocations

  return (path: PathSegment[]) => {
    for (const key in paramsPool) delete paramsPool[key]; // Clear params pool

    return compiled.map(({ pattern, original }) => {
      const matched = matchCompiledPath(path, pattern, paramsPool);
      return {
        pattern: original,
        matched,
        params: matched ? { ...paramsPool } : undefined,
      };
    });
  };
}

/**
 * Creates a lightweight boolean matcher.
 * @param patterns - Array of pattern strings.
 * @returns Function returning true if any pattern matches.
 */
export function createPathMatcher(
  patterns: string[],
): (path: PathSegment[]) => boolean {
  const compiled = patterns.map((p) => compilePattern(parsePathPattern(p)));
  const params: Record<string, string> = {};

  return (path: PathSegment[]) => {
    for (const key in params) delete params[key]; // Clear params
    return compiled.some((cp) => matchCompiledPath(path, cp, params));
  };
}
