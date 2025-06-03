import {
  RefObject,
  ChangeEvent,
  FC,
  useLayoutEffect,
  memo,
  useRef,
  useCallback,
  KeyboardEvent,
  useState,
} from "react";
import buildClassName from "../lib/buildClassName";
import { useRefInstead } from "@/shared/hooks/base";
import { requestMutation } from "@/lib/modules/fastdom";
import useUniqueId from "@/lib/hooks/utilities/useUniqueId";
import "./TextArea.scss";
import { useThrottledFunction } from "../hooks/shedulers";

type TextAreaProps = React.DetailedHTMLProps<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  HTMLTextAreaElement
>;

type OwnProps = {
  ref?: RefObject<HTMLTextAreaElement>;
  label?: string;
  error?: string;
  success?: string;
  maxLines?: number;
  maxLengthCount?: number;
  maxLengthIndicator?: boolean;
  replaceNewlines?: boolean;
} & Omit<TextAreaProps, "maxLength">;

const LINE_HEIGHT = 1.3125; // Matches CSS line-height
const DEFAULT_MAX_LINES = 5;
const BASE_LINE_HEIGHT = 21; // px (1.3125rem)
const VERTICAL_PADDING = 24; // px (10px top + 14px bottom from CSS)

const TextArea: FC<OwnProps> = ({
  ref,
  id,
  className,
  value = "",
  label,
  error,
  success,
  disabled,
  readOnly,
  placeholder,
  autoComplete,
  inputMode,
  maxLengthCount,
  maxLengthIndicator,
  tabIndex,
  maxLines = DEFAULT_MAX_LINES,
  onChange,
  replaceNewlines = false,
  ...rest
}) => {
  const uuid = useUniqueId("text-area", id);
  const textareaRef = useRefInstead<HTMLTextAreaElement>(ref);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const [isTouched, setIsTouched] = useState(false);
  const lineHeightRef = useRef(BASE_LINE_HEIGHT);

  const fullClassName = buildClassName(
    "input-group",
    error && "error",
    success && "success",
    (disabled || readOnly) && "disabled",
    label && "with-label",
    isTouched && "touched",
    className,
  );

  const errorId = `${uuid}-error`;
  const successId = `${uuid}-success`;

  // Height calculation logic
  const updateHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    requestMutation(() => {
      textarea.style.height = "auto";

      console.log(textarea.scrollHeight);

      const contentHeight = textarea.scrollHeight - VERTICAL_PADDING;
      const maxHeight = lineHeightRef.current * maxLines;
      const newHeight = Math.min(contentHeight, maxHeight) + VERTICAL_PADDING;

      requestMutation(() => {
        textarea.style.height = `${newHeight}px`;
        textarea.style.overflow = contentHeight > maxHeight ? "auto" : "hidden";
      });
    });
  }, [maxLines, textareaRef]);

  // Initial setup and value changes
  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Set initial height for one line
    textarea.style.height = `${BASE_LINE_HEIGHT + VERTICAL_PADDING}px`;

    // Setup ResizeObserver
    const observer = new ResizeObserver(updateHeight);
    observer.observe(textarea);

    // Initial update
    updateHeight();

    return () => {
      observer.disconnect();
      textarea.style.height = "";
      textarea.style.overflow = "";
    };
  }, [textareaRef, updateHeight]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setIsTouched(value.trim().length > 0);

    if (maxLengthIndicator && indicatorRef.current && maxLengthCount) {
      const remaining = maxLengthCount - value.length;
      indicatorRef.current.textContent =
        remaining >= 0 ? `Remaining: ${remaining}` : "Over limit";
    }

    onChange?.(e);
    updateHeight();
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (replaceNewlines && e.key === "Enter") {
        e.preventDefault();
        const target = e.currentTarget;
        const newValue = target.value + " ";
        target.value = newValue;
        onChange?.(e as unknown as ChangeEvent<HTMLTextAreaElement>);
        updateHeight();
      }
    },
    [replaceNewlines, onChange, updateHeight],
  );

  return (
    <div
      className={fullClassName}
      dir={navigator.language === "ar" ? "rtl" : undefined}
    >
      {label && <label htmlFor={uuid}>{label}</label>}

      <textarea
        id={uuid}
        rows={1}
        ref={textareaRef}
        aria-label={label}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : success ? successId : undefined}
        autoComplete={autoComplete}
        wrap="hard"
        className="form-control text-area awe-scrollbar"
        dir="auto"
        disabled={disabled}
        inputMode={inputMode}
        maxLength={maxLengthCount}
        placeholder={placeholder}
        readOnly={readOnly}
        tabIndex={tabIndex}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        <span>•</span>
      </textarea>

      {error && (
        <div id={errorId} className="validation-message error">
          {error}
        </div>
      )}

      {success && !error && (
        <div id={successId} className="validation-message success">
          {success}
        </div>
      )}

      {maxLengthCount && maxLengthIndicator && (
        <div ref={indicatorRef} className="max-length-indicator" />
      )}
    </div>
  );
};

export default memo(TextArea);
