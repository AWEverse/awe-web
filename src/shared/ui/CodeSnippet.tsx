import React, { ReactNode, useMemo, useState } from 'react';
import { PRETTY_BY_ALIAS } from '@/lib/utils/constants/prettyCodeLanguageName';
import buildClassName from '../lib/buildClassName';

import './CodeSnippet.scss';

type LangKey = keyof typeof PRETTY_BY_ALIAS;

interface CodeSnippetProps {
  caption?: ReactNode;
  children: Record<LangKey, ReactNode>;
  showCopyButton?: boolean;
}

const CodeSnippet: React.FC<CodeSnippetProps> = ({ caption, children, showCopyButton = false }) => {
  const languages = useMemo(() => Object.keys(children), [children]);

  const [activeTab, setActiveTab] = useState<LangKey>(languages[0]);

  const handleTabChange = (lang: LangKey) => () => {
    setActiveTab(lang);
  };

  const handleCopyClick = () => {
    const codeToCopy = children[activeTab]?.toString();
    if (codeToCopy) {
      navigator.clipboard.writeText(codeToCopy).then(() => {
        console.log('Code copied to clipboard');
      });
    }
  };

  return (
    <figure className="code-snippet">
      {caption && <figcaption className="code-snippet__caption">{caption}</figcaption>}

      <div className="code-snippet__tabs">
        {languages.map(lang => {
          const languageName = PRETTY_BY_ALIAS[lang]?.name || lang;
          return (
            <button
              key={lang}
              className={buildClassName(
                'code-snippet__tab',
                activeTab === lang && 'code-snippet__tab--active',
              )}
              onClick={handleTabChange(lang)}
            >
              {languageName}
            </button>
          );
        })}
      </div>

      <pre
        className={buildClassName(
          'code-snippet__code',
          `language-${(activeTab && PRETTY_BY_ALIAS[activeTab]?.name.toLowerCase()) || 'plaintext'}`,
        )}
      >
        <code>{children[activeTab]}</code>
      </pre>

      {showCopyButton && (
        <button
          aria-label="Copy code to clipboard"
          className="code-snippet__copy-button"
          onClick={handleCopyClick}
        >
          Copy
        </button>
      )}
    </figure>
  );
};

export default CodeSnippet;
