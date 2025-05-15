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

function createMarkdownIt(config?: { extensions?: any[] }) {
  const md = new MarkdownIt("default", {
    html: false,
    linkify: true,
    typographer: false,
    breaks: true,
  });

  const customRules = [
    {
      name: "mention",
      pattern: /^@([a-zA-Z0-9_]{1,32})/,
      attr: "data-mention",
      cls: "md-mention",
      display: (v: string) => `@${v}`,
    },
    {
      name: "tag",
      pattern: /^#([a-zA-Z0-9_]{1,32})/,
      attr: "data-tag",
      cls: "md-tag",
      display: (v: string) => `#${v}`,
    },
    {
      name: "emoji",
      pattern: /^:([a-zA-Z0-9_+-]{1,32}):/,
      attr: "data-emoji",
      cls: "md-emoji",
      display: (v: string) => `:${v}:`,
    },
  ];

  for (const rule of customRules) {
    md.inline.ruler.before("emphasis", rule.name, (state, silent) => {
      const match = state.src.slice(state.pos).match(rule.pattern);
      if (!match) return false;
      if (!silent) {
        const token = state.push(rule.name, "span", 0);
        token.content = match[1];
        token.attrs = [[rule.attr, match[1]]];
      }
      state.pos += match[0].length;
      return true;
    });

    md.renderer.rules[rule.name] = (tokens: any[], idx: number) => {
      const val = tokens[idx].content;
      return `<span class="${rule.cls}" ${rule.attr}="${val}">${rule.display(val)}</span>`;
    };
  }

  config?.extensions?.forEach((fn) => typeof fn === "function" && fn(md));
  return md;
}

function sanitize(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRS,
    allowedSchemes: ["http", "https", "mailto"],
    disallowedTagsMode: "discard",
    transformTags: {
      a: (tagName, attribs) => ({
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

function* batchIterator<T>(arr: T[], batchSize: number): Generator<T[]> {
  for (let i = 0; i < arr.length; i += batchSize) {
    yield arr.slice(i, i + batchSize);
  }
}

function processMarkdown(
  id: string,
  markdownText: string,
  md: MarkdownIt,
  enableStats?: boolean,
): MarkdownWorkerResponse {
  try {
    const html = sanitize(md.render(markdownText));
    const diagnostics = enableStats
      ? { length: markdownText.length }
      : undefined;
    return { id, html, diagnostics };
  } catch (err: any) {
    return { id, error: err?.message || "Unknown error" };
  }
}

const ctx: Worker = self as any;

ctx.addEventListener(
  "message",
  async (event: MessageEvent<MarkdownWorkerRequest>) => {
    const req = event.data;
    const stats: { start: number; end?: number } | undefined = req.enableStats
      ? { start: performance.now() }
      : undefined;
    let md: MarkdownIt | null = null;

    if (Array.isArray(req.messages)) {
      const batchSize = 32;
      const batchResponses: MarkdownWorkerResponse[] = [];
      for (const batch of batchIterator(req.messages, batchSize)) {
        if (!md) md = createMarkdownIt(req.config);
        for (const msg of batch) {
          batchResponses.push(
            processMarkdown(msg.id, msg.markdownText, md, req.enableStats),
          );
        }
      }
      if (stats) stats.end = performance.now();
      ctx.postMessage({
        batch: batchResponses,
        ...(stats
          ? {
            diagnostics: {
              timeMs: (stats.end ?? performance.now()) - stats.start,
              count: batchResponses.length,
            },
          }
          : {}),
      } satisfies MarkdownWorkerBatchResponse);
      return;
    }

    if (typeof req.markdownText === "string") {
      if (!md) md = createMarkdownIt(req.config);
      const resp = processMarkdown(
        req.id,
        req.markdownText,
        md,
        req.enableStats,
      );
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
