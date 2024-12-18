import { FC, JSX, memo } from 'react';

interface OwnLinkProps {
  href?: string;
  target?: string;
  rel?: string;
  children: React.ReactNode;
  title?: string;
  onClick?: () => void;
  className?: string;
}

interface LinkifyProps {
  text?: string | undefined;
  renderLink?: FC<OwnLinkProps>;
}

const LINK_REG = /\[([^\]]+)\]\((https?:\/\/[^\s]+)(?:\s+"([^"]+)")?\)|<((https?:\/\/[^\s]+))>/g;

const DefaultLink: FC<OwnLinkProps> = ({ children, ...props }) => <a {...props}>{children}</a>;

const processText = (text: string | undefined, Link: FC<OwnLinkProps>) => {
  if (!text) return [];

  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = LINK_REG.exec(text)) !== null) {
    const [fullMatch, linkText, url, title] = match;
    const matchStart = match.index;

    if (lastIndex < matchStart) {
      parts.push(text.slice(lastIndex, matchStart));
    }

    parts.push(
      <Link
        key={matchStart}
        className="AnchorLink"
        href={url || match[4]}
        rel="noopener noreferrer"
        target="_blank"
        title={title || ''}
      >
        {linkText || match[4]}
      </Link>,
    );

    lastIndex = matchStart + fullMatch.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
};

const Linkify: FC<LinkifyProps> = props => {
  const { text, renderLink = DefaultLink } = props;

  return processText(text, renderLink);
};

export default memo(Linkify);
