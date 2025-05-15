import { FC, ReactNode, useEffect, useState, memo, useRef } from "react";
import DOMPurify from "dompurify";
import buildClassName from "@/shared/lib/buildClassName";
import { useMarkdownProcessor } from "@/shared/hooks/markdown/useMarkdownProcessor";
import "./MessageText.scss";

interface MessageTextProps {
  /** Markdown source text */
  content: string;
  className?: string;
  loadingComponent?: ReactNode;
  errorComponent?: ReactNode;
  /** Enable caching of parsed content for repeated renders */
  enableCache?: boolean;
  /** Determine if HTML is allowed in the markdown (default: false for safety) */
  allowHTML?: boolean;
}

const contentCache = new Map<string, string>();

const MessageText: FC<MessageTextProps> = ({
  content,
  className,
  loadingComponent = null,
  errorComponent = null,
  enableCache = true,
  allowHTML = false,
}) => {
  const messageRef = useRef<HTMLDivElement>(null);
  const [parsedContent, setParsedContent] = useState<string>("");
  const { processMarkdown, isLoading, error } = useMarkdownProcessor();

  useEffect(() => {
    let isMounted = true;

    (async () => {
      if (enableCache && contentCache.has(content)) {
        const cached = contentCache.get(content)!;
        if (isMounted) setParsedContent(cached);
        return;
      }

      try {
        const result = await processMarkdown(content, { allowHTML });
        let html = result.html;
        // Sanitize html в main thread
        html = DOMPurify.sanitize(html, {
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
          FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"],
          ALLOW_DATA_ATTR: false,
          ADD_ATTR: ["target", "rel"],
        });
        if (isMounted && html) {
          if (enableCache) contentCache.set(content, html);
          setParsedContent(html);
        }
      } catch (err) {
        console.error("Error processing markdown:", err);
        if (isMounted) setParsedContent(content); // fallback to raw content on error
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [content, processMarkdown, enableCache, allowHTML]);

  if (isLoading) {
    return <>{loadingComponent}</>;
  }

  if (error) {
    return (
      <>
        {errorComponent || <div className="text-red-600 text-sm">{error}</div>}
      </>
    );
  }

  return (
    <div
      ref={messageRef}
      className={buildClassName("message-text", className)}
      dangerouslySetInnerHTML={{ __html: parsedContent }}
    />
  );
};

export default memo(MessageText);
