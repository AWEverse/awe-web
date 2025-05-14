import MarkdownIt from "markdown-it";
import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
  "a",
  "b",
  "strong",
  "i",
  "em",
  "u",
  "s",
  "del",
  "code",
  "pre",
  "blockquote",
  "ul",
  "ol",
  "li",
  "p",
  "br",
  "hr",
  "span",
];
const ALLOWED_ATTRS: Record<string, string[]> = {
  a: ["href", "title", "rel", "target"],
  span: ["data-mention", "data-tag", "data-emoji"],
  "*": [],
};

function createMarkdownIt(config?: { extensions?: any[] }) {
  const md = new MarkdownIt("default", {
    html: false,
    linkify: true,
    typographer: false,
    breaks: true,
    highlight: undefined,
  });

  // --- Inline extension: @username ---
  md.inline.ruler.before("emphasis", "mention", (state, silent) => {
    const match = state.src.slice(state.pos).match(/^@([a-zA-Z0-9_]{1,32})/);
    if (!match) return false;
    if (!silent) {
      const token = state.push("mention", "span", 0);
      token.content = match[1];
      token.attrs = [["data-mention", match[1]]];
    }
    state.pos += match[0].length;
    return true;
  });
  md.renderer.rules.mention = (tokens: any[], idx: number) => {
    const username = tokens[idx].content;
    return `<span class="md-mention" data-mention="${username}">@${username}</span>`;
  };

  // --- Inline extension: #tag ---
  md.inline.ruler.before("emphasis", "tag", (state, silent) => {
    const match = state.src.slice(state.pos).match(/^#([a-zA-Z0-9_]{1,32})/);
    if (!match) return false;
    if (!silent) {
      const token = state.push("tag", "span", 0);
      token.content = match[1];
      token.attrs = [["data-tag", match[1]]];
    }
    state.pos += match[0].length;
    return true;
  });
  md.renderer.rules.tag = (tokens: any[], idx: number) => {
    const tag = tokens[idx].content;
    return `<span class="md-tag" data-tag="${tag}">#${tag}</span>`;
  };

  // --- Inline extension: :emoji: ---
  md.inline.ruler.before("emphasis", "emoji", (state, silent) => {
    const match = state.src.slice(state.pos).match(/^:([a-zA-Z0-9_+-]{1,32}):/);
    if (!match) return false;
    if (!silent) {
      const token = state.push("emoji", "span", 0);
      token.content = match[1];
      token.attrs = [["data-emoji", match[1]]];
    }
    state.pos += match[0].length;
    return true;
  });
  md.renderer.rules.emoji = (tokens: any[], idx: number) => {
    const name = tokens[idx].content;
    return `<span class="md-emoji" data-emoji="${name}">:${name}:</span>`;
  };

  if (config?.extensions) {
    for (const ext of config.extensions) {
      if (typeof ext === "function") ext(md);
    }
  }

  return md;
}

function sanitize(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRS,
    allowedSchemes: ["http", "https", "mailto"],
    disallowedTagsMode: "discard",
    transformTags: {
      a: (tagName: any, attribs: any) => ({
        tagName,
        attribs: {
          ...attribs,
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
    },
  });
}

function* batchIterator<T>(arr: T[], batchSize: number) {
  for (let i = 0; i < arr.length; i += batchSize) {
    yield arr.slice(i, i + batchSize);
  }
}

export interface MarkdownWorkerRequest {
  id: string;
  markdownText?: string;
  messages?: { id: string; markdownText: string }[];
  config?: { extensions?: any[] };
  enableStats?: boolean;
}
export interface MarkdownWorkerResponse {
  id: string;
  html?: string;
  diagnostics?: any;
  error?: string;
}
export interface MarkdownWorkerBatchResponse {
  batch: Array<MarkdownWorkerResponse>;
}

const ctx: Worker = self as any;

ctx.addEventListener(
  "message",
  async (event: MessageEvent<MarkdownWorkerRequest>) => {
    const req = event.data;
    const stats: any = req.enableStats
      ? { start: performance.now() }
      : undefined;
    let md: MarkdownIt | null = null;

    function processOne(
      id: string,
      markdownText: string,
    ): MarkdownWorkerResponse {
      try {
        if (!md) md = createMarkdownIt(req.config);
        const html = sanitize(md.render(markdownText));
        const diagnostics = req.enableStats
          ? { length: markdownText.length }
          : undefined;
        return { id, html, diagnostics };
      } catch (err: any) {
        return { id, error: err?.message || "Unknown error" };
      }
    }

    if (Array.isArray(req.messages)) {
      const batchSize = 32; // Tune for throughput/memory
      const batchResponses: MarkdownWorkerResponse[] = [];
      for (const batch of batchIterator(req.messages, batchSize)) {
        for (const msg of batch) {
          batchResponses.push(processOne(msg.id, msg.markdownText));
        }
      }
      if (stats) stats.end = performance.now();
      ctx.postMessage({
        batch: batchResponses,
        ...(stats
          ? {
            diagnostics: {
              timeMs: stats.end - stats.start,
              count: batchResponses.length,
            },
          }
          : {}),
      } as MarkdownWorkerBatchResponse);
      return;
    }

    // Single message
    if (typeof req.markdownText === "string") {
      const resp = processOne(req.id, req.markdownText);
      if (stats) {
        stats.end = performance.now();
        resp.diagnostics = {
          ...resp.diagnostics,
          timeMs: stats.end - stats.start,
        };
      }
      ctx.postMessage(resp);
      return;
    }

    ctx.postMessage({ id: req.id, error: "Invalid request" });
  },
);

// --- Integration instructions ---
// 1. Bundle this worker with esbuild/vite as an ESM worker (no dynamic import).
// 2. Use postMessage({ id, markdownText }) for single, or { messages: [...] } for batch.
// 3. To add extensions, pass { config: { extensions: [fn1, fn2] } } in the request.
// 4. All HTML is strictly sanitized. Only whitelisted tags/attrs allowed.
// 5. No DOM or window access. Pure parsing only.
// 6. For performance stats, set enableStats: true in the request.
// 7. To add new inline rules, extend createMarkdownIt with your own markdown-it plugins.
