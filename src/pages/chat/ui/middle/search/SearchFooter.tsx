import { FC, memo, useMemo, useEffect } from 'react';
import s from './SearchFooter.module.scss';
import captureKeyboardListeners, {
  CaptureOptions,
  HandlerName,
} from '@/lib/utils/captureKeyboardListeners';
import buildClassName from '@/shared/lib/buildClassName';

type KeysArray = { key: HandlerName; action: NoneToVoidFunction | undefined }[];

const INCEPTION_KEYS_SET = [
  'onEnter',
  'onBackspace',
  'onDelete',
  'onEsc',
  'onUp',
  'onDown',
  'onLeft',
  'onRight',
  'onTab',
  'onSpace',
] as const;

const ARROWS = {
  onUp: '↑',
  onDown: '↓',
  onLeft: '←',
  onRight: '→',
};

// const TAB_SYMBOL = '\t';
// const SPACE_SYMBOL = '';

interface OwnProps {
  keys: KeysArray;
  className?: string;
  formatString?: string; // {onTab} or {onUp} {onDown} to navigate {|} {onEnter} to select {onEsc} to cancel
}

const SearchFooter: FC<OwnProps> = ({ className, keys, formatString = '' }) => {
  useEffect(() => {
    const actions = buildKeyActions(keys);

    const listenersCleanup = captureKeyboardListeners(actions);

    return () => listenersCleanup();
  }, [keys]);

  const renderContent = useMemo(
    () => renderFormattedString(keys, formatString),
    [keys, formatString],
  );

  return <div className={buildClassName(s.SearchFooter, className)}>{renderContent}</div>;
};

const buildKeyActions = (keys: KeysArray) => {
  return keys.reduce((acc, { key, action }) => ({ ...acc, [key]: action }), {} as CaptureOptions);
};

//It's enough since I only got ten listeners, but it's worth considering using, for example, a prefix tree for future implementations
const renderFormattedString = (keys: KeysArray, formatString: string) => {
  const stack: JSX.Element[] = [];
  const renderedKeys = new Set<string>();
  let textContent = '';

  const pushText = (index: number) => {
    if (textContent) {
      stack.push(
        <span key={`text-${index}`} className={s.text}>
          {textContent.trim()}
        </span>,
      );
      textContent = '';
    }
  };

  if (!formatString) {
    return stack;
  }

  const parts = formatString.split(/({[^}]+})/).filter(Boolean);

  parts.forEach((part, index) => {
    if (part.startsWith('{on') && part.endsWith('}')) {
      const key = part.slice(1, -1) as HandlerName;
      const originalKey = key.slice(2);
      const kdbContent = ARROWS[key as keyof typeof ARROWS] || originalKey;

      if (INCEPTION_KEYS_SET.includes(key) && !renderedKeys.has(key)) {
        const foundKey = keys.find(({ key: handlerKey }) => handlerKey === key);

        if (foundKey) {
          renderedKeys.add(key);

          pushText(index);

          stack.push(
            <kbd
              key={`key-${index}`}
              className={s.keyItem}
              data-key={kdbContent}
              title={`Press ${kdbContent} on keyboard`}
              onClick={foundKey.action}
            >
              {kdbContent}
            </kbd>,
          );
        }
      }
    } else {
      textContent += part;
    }
  });

  pushText(parts.length);

  return stack;
};

export default memo(SearchFooter);
export type { KeysArray };
