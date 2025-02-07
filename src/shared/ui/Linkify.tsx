import React, { FC, memo, useMemo } from "react";
import { marked, MarkedOptions } from "marked";
import DOMPurify from "dompurify";

export interface MarkdownRendererProps {
  /** Markdown text to render */
  markdown?: string;
  /** Optional CSS class name */
  className?: string;
  /** Optionally, you can pass marked options */
  markedOptions?: MarkedOptions;
}

/**
 * MarkdownRenderer renders Markdown as sanitized HTML using marked and DOMPurify.
 * It disables code highlighting by not setting a highlight option.
 */
const MarkdownRenderer: FC<MarkdownRendererProps> = ({
  markdown = "",
  className = "",
  markedOptions = {},
}) => {
  const htmlContent = useMemo(() => {
    const options: MarkedOptions = {
      gfm: true,
      breaks: true,
      ...markedOptions,
    };

    marked.setOptions(options);
    const rawHtml = marked.parse(markdown) as string;
    return DOMPurify.sanitize(rawHtml);
  }, [markdown, markedOptions]);

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

export default memo(MarkdownRenderer);
