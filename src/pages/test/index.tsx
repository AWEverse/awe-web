import { useCallback, useEffect, useRef, useState } from 'react';
import './styles.scss';
import { marked, Tokens } from 'marked';
import DOMPurify from 'dompurify';
import Pyramid from '@/entities/album-layout/ui/Pyramid';
import useValueRef from '@/lib/hooks/state/useValueRef';
import React from 'react';
import ReactDOM from 'react-dom';
import { TransitionGroup } from 'react-transition-group';
import Video from '@/shared/ui/Video';

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

const TestPage = () => {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <div>
      <Video
        canPlay
        controls
        onReady={() => console.log('Video is ready')}
        onBroken={() => console.error('Video failed to load')}
        onTimeUpdate={event => console.log('Time update:', event)}
      >
        <source
          src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
          type="video/mp4"
        />
      </Video>
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
