import { PathSyntaxError } from "./PathSyntaxError";
import { isValidIdentifier, isTemplate } from "./PathSyntaxValidators";

export type PathToken =
  | "*"
  | "**"
  | "[]"
  | string
  | { type: "param"; name: string; valueType?: "string" | "number" | "boolean" }
  | { type: "group"; options: string[] }
  | { type: "deep-param"; name: string };

export type PathSegment = string | number;
export type MatchTrace = {
  pattern: string;
  matched: boolean;
  params?: Record<string, string>;
};

const MAX_CACHE_SIZE = 1000;
const parseCache = new Map<string, PathToken[]>();

const enum Tokens {
  Star = "*",
  Deep = "**",
  Array = "[]",
}

function parsePathPattern(input: string): PathToken[] {
  if (!input) throw new PathSyntaxError("<empty>", 0);
  const cached = parseCache.get(input);
  if (cached) return cached;

  const tokens: PathToken[] = [];
  let start = 0;

  for (let i = 0; i <= input.length; i++) {
    if (i === input.length || input[i] === ".") {
      const seg = input.slice(start, i);
      if (!seg) throw new PathSyntaxError("<empty>", tokens.length);

      if (seg === Tokens.Star || seg === Tokens.Deep || seg === Tokens.Array) {
        tokens.push(seg);
      } else if (seg.startsWith(":")) {
        const [name, valueType] = seg.slice(1).split(":");
        if (!isValidIdentifier(name)) throw new PathSyntaxError(seg, tokens.length);
        const allowedTypes = ["string", "number", "boolean"];
        tokens.push({ type: "param", name, valueType: allowedTypes.includes(valueType!) ? valueType as any : undefined });
      } else if (seg.startsWith("**:")) {
        const name = seg.slice(3);
        if (!isValidIdentifier(name)) throw new PathSyntaxError(seg, tokens.length);
        tokens.push({ type: "deep-param", name });
      } else if (seg.startsWith("(") && seg.endsWith(")")) {
        const options = seg.slice(1, -1).split("|");
        if (options.some((opt) => !isValidIdentifier(opt))) throw new PathSyntaxError(seg, tokens.length);
        tokens.push({ type: "group", options });
      } else if (isValidIdentifier(seg) || isTemplate(seg)) {
        tokens.push(seg);
      } else {
        throw new PathSyntaxError(seg, tokens.length);
      }
      start = i + 1;
    }
  }

  if (parseCache.size >= MAX_CACHE_SIZE) parseCache.delete(parseCache.keys().next().value);
  parseCache.set(input, tokens);
  return tokens;
}

function matchSegment(
  pattern: PathToken,
  actual: PathSegment,
  params: Record<string, string>
): boolean {
  const value = String(actual);
  if (pattern === Tokens.Star) return typeof actual === "string";
  if (pattern === Tokens.Array) return typeof actual === "number";
  if (typeof pattern === "object") {
    switch (pattern.type) {
      case "param": {
        if (pattern.valueType === "number" && isNaN(+actual)) return false;
        if (pattern.valueType === "boolean" && value !== "true" && value !== "false") return false;
        params[pattern.name] = value;
        return true;
      }
      case "group":
        return typeof actual === "string" && pattern.options.includes(actual);
      case "deep-param":
        return true;
    }
  }
  return pattern === (typeof actual === "string" ? actual : value);
}

interface CompiledPattern {
  tokens: PathToken[];
  prefixLen: number;
  suffixLen: number;
  hasDeep: boolean;
}

function compilePattern(tokens: PathToken[]): CompiledPattern {
  const firstDeep = tokens.findIndex(
    (t) => t === Tokens.Deep || (typeof t === "object" && t.type === "deep-param")
  );
  return {
    tokens,
    prefixLen: firstDeep === -1 ? tokens.length : firstDeep,
    suffixLen: firstDeep === -1 ? 0 : tokens.length - firstDeep - 1,
    hasDeep: firstDeep !== -1,
  };
}

function matchCompiledPath(
  path: PathSegment[],
  compiled: CompiledPattern,
  params: Record<string, string>
): boolean {
  const { tokens, prefixLen, suffixLen, hasDeep } = compiled;
  const pathLen = path.length;

  if (!hasDeep && pathLen !== tokens.length) return false;
  if (hasDeep && pathLen < prefixLen + suffixLen) return false;

  for (let i = 0; i < prefixLen; i++) {
    if (!matchSegment(tokens[i], path[i], params)) return false;
  }

  if (hasDeep) {
    const deepToken = tokens[prefixLen];
    const deepLen = pathLen - prefixLen - suffixLen;
    if (typeof deepToken === "object" && deepToken.type === "deep-param") {
      params[deepToken.name] = path.slice(prefixLen, prefixLen + deepLen).map(String).join(".");
    }
    for (let i = 0; i < suffixLen; i++) {
      const patternToken = tokens[tokens.length - suffixLen + i];
      const actualSegment = path[pathLen - suffixLen + i];
      if (!matchSegment(patternToken, actualSegment, params)) return false;
    }
  }

  return true;
}

export function createPathMatcherWithTrace(
  patterns: string[]
): (path: PathSegment[], paramsPool?: Record<string, string>) => MatchTrace[] {
  const compiled = patterns.map((p) => ({
    pattern: compilePattern(parsePathPattern(p)),
    original: p,
  }));

  return (path: PathSegment[], externalPool?: Record<string, string>) => {
    const pool = externalPool ?? {} as Record<string, string>;
    const traces: MatchTrace[] = [];

    for (let i = 0; i < compiled.length; i++) {
      for (const k in pool) delete pool[k];
      const { pattern, original } = compiled[i];
      const matched = matchCompiledPath(path, pattern, pool);
      traces.push({ pattern: original, matched, params: matched ? { ...pool } : undefined });
    }

    return traces;
  };
}

export function createPathMatcher(patterns: string[]): (path: PathSegment[]) => boolean {
  const compiled = patterns.map((p) => compilePattern(parsePathPattern(p)));
  const params: Record<string, string> = {};

  return (path: PathSegment[]) => {
    for (const k in params) delete params[k];
    for (let i = 0; i < compiled.length; i++) {
      if (matchCompiledPath(path, compiled[i], params)) return true;
    }
    return false;
  };
}
