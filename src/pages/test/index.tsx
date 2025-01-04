import { useEffect, useState } from 'react';
import './styles.scss';
import { marked, Tokens } from 'marked';
import DOMPurify from 'dompurify';

import MoonPhases from '@/shared/common/MoonPhases';

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
    <div style={{ padding: '12rem' }}>
      <MoonPhases phase={10} />
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
