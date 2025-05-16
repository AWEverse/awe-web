import { FC, PropsWithChildren, ReactNode, memo } from 'react';
import s from './Placeholder.module.scss';
import buildClassName from '@/shared/lib/buildClassName';

interface RootProps {
  className?: string;
  ariaLabel?: string;
}

export const Root: FC<PropsWithChildren<RootProps>> = memo(({ className, ariaLabel = 'First chat view welcome message', children }) => {
  const rootClassName = buildClassName(s.TemplateComponent, s.Root, className);
  return (
    <section aria-label={ariaLabel} className={rootClassName} role="region">
      {children}
    </section>
  );
});

interface HeaderProps {
  title?: ReactNode;
  className?: string;
}

export const Header: FC<PropsWithChildren<HeaderProps>> = memo(({ title, className, children }) => {
  const headerClassName = buildClassName(s.Header, className);
  return (
    <header className={headerClassName}>
      {title && <h2 className={s.Heading}>{title}</h2>}
      {children}
    </header>
  );
});

interface ContentProps {
  emojiLabel?: string;
  emojiSymbol?: ReactNode;
  message?: ReactNode;
  className?: string;
}

export const Content: FC<PropsWithChildren<ContentProps>> = memo(({ emojiLabel, emojiSymbol, message, className, children }) => {
  const contentClassName = buildClassName(s.Content, className);
  return (
    <div className={contentClassName}>
      {emojiSymbol && (
        <span aria-label={emojiLabel} className={s.Emoji} role="img">
          {emojiSymbol}
        </span>
      )}
      {message && <p className={s.Text}>{message}</p>}
      {children}
    </div>
  );
});
