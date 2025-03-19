import { HandlerName } from "@/lib/utils/captureKeyboardListeners";
import buildClassName from "@/shared/lib/buildClassName";
import { FC, memo, useEffect, ReactNode } from "react";

type NoneToVoidFunction = () => void;

type KeysArray = {
  key: HandlerName;
  action: NoneToVoidFunction | undefined;
  description?: string;
}[];

type CaptureOptions = {
  bindings: Partial<Record<HandlerName, NoneToVoidFunction | undefined>>;
};

// Define constants
const ARROWS = {
  onUp: "↑",
  onDown: "↓",
  onLeft: "←",
  onRight: "→",
};

const KEY_CODES: Record<string, HandlerName> = {
  Enter: "onEnter",
  Backspace: "onBackspace",
  Delete: "onDelete",
  Escape: "onEsc",
  ArrowUp: "onUp",
  ArrowDown: "onDown",
  ArrowLeft: "onLeft",
  ArrowRight: "onRight",
  Tab: "onTab",
  " ": "onSpace",
};

// Utility to capture keyboard listeners
function captureKeyboardListeners(options: CaptureOptions): () => void {
  const { bindings } = options;

  const handleKeyDown = (e: KeyboardEvent) => {
    const key = KEY_CODES[e.key];

    if (key && bindings[key]) {
      const handler = bindings[key];
      if (handler) {
        e.preventDefault();
        handler();
      }
    }
  };

  document.addEventListener("keydown", handleKeyDown);

  return () => {
    document.removeEventListener("keydown", handleKeyDown);
  };
}

interface OwnProps {
  keys: KeysArray;
  className?: string;
  formatString?: string;
}

const SearchFooter: FC<OwnProps> = ({ className, keys, formatString = "" }) => {
  useEffect(() => {
    const actions = buildKeyActions(keys);
    const listenersCleanup = captureKeyboardListeners(actions);
    return () => listenersCleanup();
  }, [keys]);

  const renderContent = formatString
    ? renderFormattedString(keys, formatString)
    : renderDefaultContent(keys);

  return (
    <div className={buildClassName("search-footer", className)}>
      {renderContent}
    </div>
  );
};

const buildKeyActions = (keys: KeysArray): CaptureOptions => {
  const bindings = keys.reduce(
    (acc, { key, action }) => {
      acc[key] = action;
      return acc;
    },
    {} as Partial<Record<HandlerName, NoneToVoidFunction | undefined>>,
  );

  return { bindings };
};

const renderFormattedString = (
  keys: KeysArray,
  formatString: string,
): ReactNode[] => {
  const stack: ReactNode[] = [];
  const renderedKeys = new Set<HandlerName>();
  let textContent = "";

  const pushText = () => {
    if (textContent.trim()) {
      stack.push(textContent.trim());
      textContent = "";
    }
  };

  const parts = formatString.split(/({[^}]+})/).filter(Boolean);

  parts.forEach((part) => {
    if (part.startsWith("{") && part.endsWith("}")) {
      const keyName = part.slice(1, -1) as HandlerName;

      if (
        Object.values(KEY_CODES).includes(keyName) &&
        !renderedKeys.has(keyName)
      ) {
        const foundKey = keys.find(({ key }) => key === keyName);

        if (foundKey) {
          renderedKeys.add(keyName);
          pushText();

          const kbdContent =
            ARROWS[keyName as keyof typeof ARROWS] || keyName.slice(2);
          stack.push(
            <kbd key={keyName} className="search-footer-key">
              {kbdContent}
            </kbd>,
          );
        }
      } else {
        textContent += part;
      }
    } else {
      textContent += part;
    }
  });

  pushText();
  return stack;
};

const renderDefaultContent = (keys: KeysArray): ReactNode[] => {
  return keys
    .filter((key) => key.action && key.description)
    .map(({ key: keyName, description }) => {
      const kbdContent =
        ARROWS[keyName as keyof typeof ARROWS] || keyName.slice(2);

      return (
        <div key={keyName} className="search-footer-item">
          <kbd className="search-footer-key">{kbdContent}</kbd>
          <span className="search-footer-description">{description}</span>
        </div>
      );
    });
};

export default memo(SearchFooter);
export type { KeysArray, HandlerName };
