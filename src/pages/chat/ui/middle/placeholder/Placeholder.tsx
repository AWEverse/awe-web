import { FC, PropsWithChildren, ReactNode } from 'react';
import s from './Placeholder.module.scss';
import buildClassName from '@/shared/lib/buildClassName';

interface RootProps {
  className?: string;
  ariaLabel?: string;
}

const Root: FC<PropsWithChildren<RootProps>> = ({ className, ariaLabel = 'First chat view wellcome message', children }) => {
  const rootClassName = buildClassName(s.TemplateComponent, s.Root, className);

  return (
    <section aria-labelledby={ariaLabel} className={rootClassName} role="region">
      {children}
    </section>
  );
};

interface HeaderProps {
  title?: ReactNode;
  className?: string;
}

const Header: FC<PropsWithChildren<HeaderProps>> = ({ title, className, children }) => {
  const headerClassName = buildClassName(s.Header, className);

  return (
    <header className={headerClassName}>
      <h2 className={s.Heading}>{title}</h2>
      {children}
    </header>
  );
};

interface ContentProps {
  emojiLabel?: string;
  emojiSymbol?: ReactNode;
  message?: ReactNode;
  className?: string;
}

const Content: FC<PropsWithChildren<ContentProps>> = ({ emojiLabel, emojiSymbol, message, className, children }) => {
  const contentClassName = buildClassName(s.Content, className);

  return (
    <div className={contentClassName}>
      <span aria-label={emojiLabel} className={s.Emoji} role="img">
        {emojiSymbol}
      </span>
      <p className={s.Text}>{message}</p>
      {children}
    </div>
  );
};

export default { Root, Header, Content };
