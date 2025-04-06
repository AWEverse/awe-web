import {
  FC,
  ReactNode,
  useEffect,
  useState,
  useMemo,
  memo,
  useRef,
  useCallback,
} from "react";
import { marked, MarkedOptions } from "marked";
import DOMPurify from "dompurify";
import buildClassName from "@/shared/lib/buildClassName";
import "./MessageText.scss";

interface MessageTextProps {
  children: string;
  className?: string;
  loadingComponent?: ReactNode;
  errorComponent?: ReactNode;
  /** Enable caching of parsed content for repeated renders */
  enableCache?: boolean;
  /** Add a worker for offloading parsing (improves UI responsiveness) */
  useWorker?: boolean;
  /** Determine if HTML is allowed in the markdown (default: false for safety) */
  allowHTML?: boolean;
}

// Default safe tags to allow in markdown rendering - limited to most essential ones
const safeAllowedTags = [
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "a",
  "ul",
  "ol",
  "li",
  "b",
  "i",
  "strong",
  "em",
  "code",
  "hr",
  "br",
  "pre",
];

// Default safe attributes - strictly limited for security
const safeAllowedAttributes = ["href", "title", "class"];

// Create a global cache for parsed content to improve performance
const contentCache = new Map<string, string>();

// Configure DOMPurify for a safe environment
DOMPurify.setConfig({
  FORBID_TAGS: [
    "style",
    "script",
    "iframe",
    "form",
    "object",
    "embed",
    "input",
    "button",
    "textarea",
  ],
  FORBID_ATTR: ["style", "onerror", "onload", "onclick", "onmouseover"],
  ALLOW_DATA_ATTR: false,
});

const MessageText: FC<MessageTextProps> = ({
  children,
  className,
  loadingComponent,
  errorComponent,
  enableCache = true,
  useWorker = true,
  allowHTML = false,
}) => {
  const messageRef = useRef<HTMLDivElement>(null);
  const [parsedContent, setParsedContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const contentKey = useRef(children);

  const renderer = useMemo(() => {
    const r = new marked.Renderer();

    r.link = ({ href, title, text }) => {
      const urlPattern =
        /^(https?:\/\/)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+(:\d+)?(\/\S*)?$/;
      const safeHref = urlPattern.test(href) ? href : "#";

      return `<a href="${safeHref}"
                target="_blank"
                rel="noopener noreferrer nofollow"
                ${title ? `title="${title}"` : ""}>
                ${text}
              </a>`;
    };

    r.code = ({ text, lang }: { text: string; lang?: string }) => {
      const sanitizedCode = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      return `<pre><code class="language-${lang || ""}">${sanitizedCode}</code></pre>`;
    };

    return r;
  }, []);

  const markedOptions = useMemo<MarkedOptions>(() => {
    return {
      renderer,
      async: true,
      breaks: true,
      gfm: true,
      pedantic: false,
      headerIds: false,
      silent: true,
    };
  }, [renderer]);

  const sanitizeHtml = useCallback(
    (html: string) => {
      return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: allowHTML ? undefined : safeAllowedTags,
        ALLOWED_ATTR: allowHTML ? undefined : safeAllowedAttributes,
        ADD_ATTR: ["target", "rel"],
        RETURN_DOM_FRAGMENT: false,
        RETURN_DOM: false,
        FORCE_BODY: false,
      });
    },
    [allowHTML],
  );

  const processContentInWorker = useCallback(
    async (content: string): Promise<string> => {
      if (enableCache && contentCache.has(content)) {
        return contentCache.get(content)!;
      }

      try {
        const parsedMarkdown = await marked.parse(content, markedOptions);
        const cleanHTML = sanitizeHtml(parsedMarkdown);

        if (enableCache) {
          contentCache.set(content, cleanHTML);
        }
        return cleanHTML;
      } catch (error) {
        console.error("Parsing error:", error);
        return sanitizeHtml(
          content
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\n/g, "<br>"),
        );
      }
    },
    [markedOptions, sanitizeHtml, enableCache],
  );

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const signal = controller.signal;

    if (enableCache && contentKey.current === children && parsedContent) {
      setIsLoading(false);
      return;
    }

    contentKey.current = children;
    setIsLoading(true);

    const parseContent = async () => {
      try {
        const processWithIdleCallback = (callback: () => void) => {
          if ("requestIdleCallback" in window) {
            window.requestIdleCallback(callback, { timeout: 500 });
          } else {
            setTimeout(callback, 1);
          }
        };

        processWithIdleCallback(async () => {
          if (signal.aborted) return;
          try {
            const processed = await processContentInWorker(children);
            if (isMounted && !signal.aborted) {
              setParsedContent(processed);
              setIsLoading(false);
            }
          } catch (err) {
            if (isMounted && !signal.aborted) {
              console.error("Processing error:", err);
              setError("Content processing failed");
              setIsLoading(false);
            }
          }
        });
      } catch (err) {
        if (isMounted) {
          console.error("Error in parse flow:", err);
          setError("Failed to parse content");
          setIsLoading(false);
        }
      }
    };

    parseContent().then(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [children, processContentInWorker, enableCache, parsedContent]);

  if (isLoading) {
    return loadingComponent || null;
  }

  if (error) {
    return (
      errorComponent || <div className="text-red-600 text-sm">{error}</div>
    );
  }

  // The final rendered component with styling applied only for the message text.
  // Tailwind's "prose" classes are used here to style markdown content.
  return (
    <div
      ref={messageRef}
      className={buildClassName("message-text", className)}
      dangerouslySetInnerHTML={{ __html: parsedContent }}
    ></div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(MessageText);
