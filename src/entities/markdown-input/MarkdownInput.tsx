import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import s from "./MarkdownInput.module.scss";

function useMarkdownInput({
  value = "",
  sanitizeFn,
  validate,
  maxLength,
  clearOnSubmit,
  submitOnCtrlEnter,
  submitKey,
  onChange,
  onSubmit,
}: Partial<{
  value: string;
  sanitizeFn: (v: string) => string;
  validate: (v: string) => boolean | string;
  maxLength: number;
  clearOnSubmit: boolean;
  submitOnCtrlEnter: boolean;
  submitKey: string;
  onChange: (v: string) => void;
  onSubmit: (v: string) => void;
}>) {
  const [text, setText] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const lastValue = useRef(value);

  const sanitize = useCallback(
    (raw: string) => {
      const norm = raw.replace(/\r\n/g, "\n");
      return sanitizeFn ? sanitizeFn(norm) : norm;
    },
    [sanitizeFn],
  );

  const validateInput = useCallback(
    (v: string) => {
      if (!validate) return true;
      const result = validate(v);
      if (typeof result === "string") {
        setError(result);
        return false;
      }
      if (!result) {
        setError("Invalid input");
        return false;
      }
      setError(null);
      return true;
    },
    [validate],
  );

  useEffect(() => {
    const sanitized = sanitize(value);
    setText(sanitized);
    lastValue.current = sanitized;
  }, [value, sanitize]);

  const handleTextChange = useCallback(
    (newText: string) => {
      const sanitized = sanitize(newText);
      if (maxLength && sanitized.length > maxLength) {
        const truncated = sanitized.slice(0, maxLength);
        setText(truncated);
        onChange?.(truncated);
        lastValue.current = truncated;
        return;
      }
      setText(sanitized);
      if (sanitized !== lastValue.current) {
        onChange?.(sanitized);
        lastValue.current = sanitized;
      }
      validateInput(sanitized);
    },
    [sanitize, maxLength, onChange, validateInput],
  );

  const handleSubmit = useCallback(() => {
    if (validateInput(text)) {
      onSubmit?.(text);
      if (clearOnSubmit) {
        setText("");
        lastValue.current = "";
      }
    }
  }, [text, validateInput, onSubmit, clearOnSubmit]);

  return { text, error, handleTextChange, handleSubmit };
}

export interface MarkdownInputProps {
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  className?: string;
  maxLength?: number;
  autoFocus?: boolean;
  minHeight?: number;
  maxHeight?: number;
  containerStyle?: React.CSSProperties;
  inputStyle?: React.CSSProperties;
  renderMarkdown?: boolean;
  actions?: React.ReactNode;
  sanitizeFn?: (value: string) => string;
  clearOnSubmit?: boolean;
  submitOnCtrlEnter?: boolean;
  submitKey?: string;
  showCharCount?: boolean;
  validate?: (value: string) => boolean | string;
  id?: string;
  ariaLabel?: string;
  name?: string;
  required?: boolean;
  enableTabCharacter?: boolean;
  tabSize?: number;
}

const MarkdownInput = forwardRef<HTMLDivElement, MarkdownInputProps>(
  (
    {
      value,
      placeholder = "Type your message...",
      disabled = false,
      onChange,
      onSubmit,
      className,
      maxLength,
      autoFocus = false,
      minHeight = 40,
      maxHeight = 200,
      containerStyle = {},
      inputStyle = {},
      renderMarkdown = false,
      actions,
      sanitizeFn,
      clearOnSubmit = false,
      submitOnCtrlEnter = false,
      submitKey = "Enter",
      showCharCount = false,
      validate,
      id,
      ariaLabel = "Markdown text input",
      name,
      required = false,
      enableTabCharacter = true,
      tabSize = 2,
    },
    ref,
  ) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const { text, error, handleTextChange, handleSubmit } = useMarkdownInput({
      value,
      sanitizeFn,
      validate,
      maxLength,
      clearOnSubmit,
      submitOnCtrlEnter,
      submitKey,
      onChange,
      onSubmit,
    });

    useImperativeHandle(ref, () => editorRef.current as HTMLDivElement, []);

    useEffect(() => {
      if (autoFocus && editorRef.current && !disabled) {
        editorRef.current.focus();
      }
    }, [autoFocus, disabled]);

    const onInput = useCallback(
      (e: React.FormEvent<HTMLDivElement>) => {
        handleTextChange(e.currentTarget.innerText || "");
      },
      [handleTextChange],
    );

    const onKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        const isEnter = e.key === "Enter";
        const submitCondition =
          isEnter &&
          ((submitOnCtrlEnter && (e.ctrlKey || e.metaKey)) ||
            (!submitOnCtrlEnter && !e.shiftKey));

        if (submitCondition) {
          e.preventDefault();
          handleSubmit();
        }

        if (e.key === "Tab" && enableTabCharacter) {
          e.preventDefault();
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(" ".repeat(tabSize)));
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }
      },
      [submitOnCtrlEnter, handleSubmit, enableTabCharacter, tabSize],
    );

    const previewHTML = useMemo(
      () =>
        renderMarkdown
          ? DOMPurify.sanitize(marked.parseInline(text) as string, {
              ALLOWED_TAGS: ["strong", "em", "code", "a", "span", "br"],
              ALLOWED_ATTR: ["href", "target", "rel"],
              FORCE_BODY: true,
            })
          : "",
      [renderMarkdown, text],
    );

    return (
      <div
        className={`${s.container} ${className || ""}`}
        style={{
          borderRadius: 20,
          padding: 0,
          borderWidth: 1,
          position: "relative",
          ...containerStyle,
        }}
        data-error={!!error}
      >
        <div
          id={id}
          ref={editorRef}
          role="textbox"
          contentEditable={!disabled}
          suppressContentEditableWarning
          spellCheck
          aria-label={ariaLabel}
          aria-required={required}
          aria-invalid={!!error}
          data-name={name}
          className={`${s.editor} ${error ? s.error : ""}`}
          onInput={onInput}
          onKeyDown={onKeyDown}
          style={{
            minHeight,
            maxHeight,
            overflowY: "auto",
            padding: "12px 16px",
            borderRadius: 20,
            background: "var(--awe-palette-background-paper)",
            fontSize: 16,
            lineHeight: 1.5,
            ...inputStyle,
          }}
          data-placeholder={placeholder}
        />

        {error && <div className={s.errorMessage}>{error}</div>}

        {showCharCount && maxLength !== undefined && (
          <div className={s.charCount}>
            {maxLength - text.length} characters remaining
          </div>
        )}

        {actions && <div className={s.actions}>{actions}</div>}

        {renderMarkdown && text && (
          <div
            className={s.markdownPreview}
            dangerouslySetInnerHTML={{ __html: previewHTML }}
          />
        )}
      </div>
    );
  },
);

MarkdownInput.displayName = "MarkdownInput";

export default memo(MarkdownInput);
