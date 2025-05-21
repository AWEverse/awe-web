import { FC, memo, useMemo } from "react";
import DOMPurify from "dompurify";
import MarkedIt from "markdown-it";

export interface LinkifyProps {
  /** Text to linkify (plain text, not markdown) */
  text?: string;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Linkify renders plain text as sanitized HTML with clickable links using marked-it and DOMPurify.
 */
const Linkify: FC<LinkifyProps> = ({ text = "", className = "" }) => {
  const htmlContent = useMemo(() => {
    const markedIt = new MarkedIt();
    const result = markedIt.render(text);
    return DOMPurify.sanitize(result);
  }, [text]);

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

export default memo(Linkify);
