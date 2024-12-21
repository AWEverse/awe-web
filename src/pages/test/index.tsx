import { useCallback, useEffect, useRef, useState } from 'react';
import './styles.scss';
import { marked, Tokens } from 'marked';
import DOMPurify from 'dompurify';
import Pyramid from '@/entities/album-layout/ui/Pyramid';
import useValueRef from '@/lib/hooks/state/useValueRef';
import React from 'react';
import ReactDOM from 'react-dom';
import { TransitionGroup } from 'react-transition-group';

marked.use({
  breaks: true,
  gfm: true,
  pedantic: true,
  renderer: {
    blockquote(quote: Tokens.Blockquote) {
      return `<blockquote class="markdown-alert">${this.parser.parse(quote.tokens)}</blockquote>`;
    },
  },
});

type RDate = '^([0-5]?d)s([01]?d|2[0-3])s([01]?d|2[0-9]|3[01])s([1-9]|1[0-2])s([0-7])$';

interface ReplaceTransitionProps {
  in: boolean;
  children: React.ReactNode;
  onEnter?: (node?: Element) => void;
  onEntering?: (node?: Element) => void;
  onEntered?: (node?: Element) => void;
  onExit?: (node?: Element) => void;
  onExiting?: (node?: Element) => void;
  onExited?: (node?: Element) => void;
}

const ReplaceTransition: React.FC<ReplaceTransitionProps> = ({
  in: inProp,
  children,
  onEnter,
  onEntering,
  onEntered,
  onExit,
  onExiting,
  onExited,
  ...props
}) => {
  const handleLifecycle = useCallback(
    (handler: string, idx: number, originalArgs: any[]) => {
      const child = React.Children.toArray(children)[idx];
      if (child && (child as any).props[handler]) {
        (child as any).props[handler](...originalArgs);
      }

      if (
        handler &&
        (handler === 'onEnter' ||
          handler === 'onEntering' ||
          handler === 'onEntered' ||
          handler === 'onExit' ||
          handler === 'onExiting' ||
          handler === 'onExited')
      ) {
        const maybeNode = (child as any).props.nodeRef;
        if (handler === 'onEnter' && onEnter) onEnter(maybeNode);
        if (handler === 'onEntering' && onEntering) onEntering(maybeNode);
        if (handler === 'onEntered' && onEntered) onEntered(maybeNode);
        if (handler === 'onExit' && onExit) onExit(maybeNode);
        if (handler === 'onExiting' && onExiting) onExiting(maybeNode);
        if (handler === 'onExited' && onExited) onExited(maybeNode);
      }
    },
    [children, onEnter, onEntering, onEntered, onExit, onExiting, onExited],
  );

  const handleEnter = useCallback(
    (...args as any) => handleLifecycle('onEnter', 0, args),
    [handleLifecycle],
  );
  const handleEntering = useCallback(
    (...args as any) => handleLifecycle('onEntering', 0, args),
    [handleLifecycle],
  );
  const handleEntered = useCallback(
    (...args as any) => handleLifecycle('onEntered', 0, args),
    [handleLifecycle],
  );

  const handleExit = useCallback(
    (...args as any) => handleLifecycle('onExit', 1, args),
    [handleLifecycle],
  );
  const handleExiting = useCallback(
    (...args as any) => handleLifecycle('onExiting', 1, args),
    [handleLifecycle],
  );
  const handleExited = useCallback(
    (...args as any) => handleLifecycle('onExited', 1, args),
    [handleLifecycle],
  );

  const [first, second] = React.Children.toArray(children);

  return (
    <TransitionGroup {...props}>
      {inProp
        ? React.cloneElement(first as React.ReactElement, {
            key: 'first',
            onEnter: handleEnter,
            onEntering: handleEntering,
            onEntered: handleEntered,
          })
        : React.cloneElement(second as React.ReactElement, {
            key: 'second',
            onEnter: handleExit,
            onEntering: handleExiting,
            onEntered: handleExited,
          })}
    </TransitionGroup>
  );
};

const TestPage = () => {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <div>
      <button onClick={() => setIsVisible(!isVisible)}>Toggle Transition</button>

      <ReplaceTransition in={isVisible}>
        <div>I appear first</div>
        <div>I replace the above</div>
      </ReplaceTransition>
    </div>
  );

  // #v-ifdef false
  const [markdownContent, setMarkdownContent] = useState('');

  useEffect(() => {
    const fetchMarkdownFile = async () => {
      try {
        // Fetch the markdown file from the public folder
        const response = await fetch('/common_markdown_tags.md');

        if (!response.ok) {
          throw new Error('Markdown file not found');
        }

        const text = await response.text(); // Read the file content as text
        const htmlContent = marked(text, { breaks: true }); // Parse the markdown to HTML

        // Sanitize the HTML content to prevent XSS attacks
        const sanitizedContent = DOMPurify.sanitize(htmlContent as string);
        setMarkdownContent(sanitizedContent); // Set sanitized content
      } catch (error) {
        console.error('Error fetching markdown file:', error);
      }
    };

    fetchMarkdownFile();
  }, []);

  return (
    <div
      className="markdown-body"
      style={{ height: '100dvh', width: '100dvw', padding: '2rem', overflow: 'auto' }}
    >
      {markdownContent.length > 0 && (
        <div
          dangerouslySetInnerHTML={{ __html: markdownContent }} // Safe to use now
        />
      )}
    </div>
  );

  // #v-endif
};

export default TestPage;
