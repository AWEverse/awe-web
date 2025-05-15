import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import s from "./MarkdownInput.module.scss";
import { requestMutation, requestNextMutation } from "@/lib/modules/fastdom";
import { useStableCallback } from "@/shared/hooks/base";
import buildClassName from "@/shared/lib/buildClassName";
import useMarkdownInput from "../hooks/useMarkdownInput";
import Placeholder from "@/shared/ui/Placeholder";

export interface MarkdownInputProps {
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  onSelectionChange?: (value: string) => void;
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
  isStylesRemoved?: boolean;
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
      isStylesRemoved = false,
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

    const [isFocused, setIsFocused] = React.useState(false);

    useEffect(() => {
      if (editorRef.current && editorRef.current.textContent !== text) {
        editorRef.current.textContent = text;
      }
    }, [text]);

    const onInput = useCallback(
      (e: React.FormEvent<HTMLDivElement>) => {
        handleTextChange(e.currentTarget.textContent || "");
      },
      [handleTextChange],
    );

    const onKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        const key = e.key;
        const isSubmitKey = key === (submitKey || "Enter");
        let submitCondition = false;

        if (submitOnCtrlEnter) {
          submitCondition = isSubmitKey && (e.ctrlKey || e.metaKey);
        } else {
          if (submitKey && submitKey !== "Enter") {
            submitCondition = isSubmitKey;
          } else {
            submitCondition = isSubmitKey && !e.shiftKey;
          }
        }

        if (submitCondition) {
          e.preventDefault();
          handleSubmit();
        }

        if (e.key === "Tab" && enableTabCharacter) {
          e.preventDefault();

          requestNextMutation(() => {
            const selection = window.getSelection();

            if (selection && selection.rangeCount > 0) {
              return () => {
                const range = selection.getRangeAt(0);
                range.deleteContents();
                range.insertNode(document.createTextNode(" ".repeat(tabSize)));
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
              };
            }
          });
        }
      },
      [submitOnCtrlEnter, submitKey, handleSubmit, enableTabCharacter, tabSize],
    );

    const onPaste = useStableCallback(
      (e: React.ClipboardEvent<HTMLDivElement>) => {
        e.preventDefault();

        requestNextMutation(() => {
          const pastedText = e.clipboardData.getData("text/plain");
          const selection = window.getSelection();

          if (!selection || selection.rangeCount === 0) {
            return undefined;
          }

          const range = selection.getRangeAt(0);

          return () => {
            range.deleteContents();
            range.insertNode(document.createTextNode(pastedText));
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
          };
        });
      },
    );

    const previewHTML = useMemo(
      () =>
        renderMarkdown
          ? DOMPurify.sanitize(marked.parseInline(text) as string, {
              ALLOWED_TAGS: [
                "strong",
                "em",
                "code",
                "a",
                "span",
                "br",
                "h1",
                "h2",
                "h3",
                "h4",
                "h5",
                "h6",
              ],
              ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^#&?]+#)/i,
              ALLOWED_ATTR: ["href", "target", "rel"],
              FORCE_BODY: true,
            })
          : "",
      [renderMarkdown, text],
    );

    return (
      <div
        className={buildClassName(!isStylesRemoved && s.container, className)}
        style={{
          borderRadius: 20,
          padding: 0,
          borderWidth: 1,
          position: "relative",
          ...containerStyle,
        }}
        data-error={!!error}
      >
        <Placeholder
          className={s.placeholder}
          showText={!isFocused && text.length === 0}
        >
          {placeholder}
        </Placeholder>

        <div
          id={id}
          ref={editorRef}
          role="textbox"
          data-focused={isFocused}
          contentEditable={!disabled}
          suppressContentEditableWarning
          spellCheck
          aria-label={ariaLabel}
          aria-required={required}
          aria-invalid={!!error}
          aria-multiline="true"
          aria-describedby={error ? "error-message" : undefined}
          aria-placeholder={placeholder}
          data-disabled={disabled}
          data-id={id}
          data-aria-label={ariaLabel}
          data-name={name}
          className={buildClassName(!isStylesRemoved && s.editor, className)}
          onInput={onInput}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          onFocus={() => {
            setIsFocused(true);
            if (editorRef.current) {
              requestMutation(() => {
                editorRef.current?.classList.add(s.focused);
              });
            }
          }}
          onBlur={() => {
            setIsFocused(false);
            if (editorRef.current) {
              requestMutation(() => {
                editorRef.current?.classList.remove(s.focused);
              });
            }
          }}
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

        {error && (
          <div
            id="error-message"
            className={buildClassName(!isStylesRemoved && s.errorMessage)}
          >
            {error}
          </div>
        )}

        {showCharCount && maxLength !== undefined && (
          <div
            aria-live="polite"
            className={buildClassName(!isStylesRemoved && s.charCount)}
          >
            {maxLength - text.length} characters remaining
          </div>
        )}

        {actions && (
          <div className={buildClassName(!isStylesRemoved && s.actions)}>
            {actions}
          </div>
        )}

        {renderMarkdown && text && (
          <div
            className={buildClassName(!isStylesRemoved && s.markdownPreview)}
            dangerouslySetInnerHTML={{ __html: previewHTML }}
          />
        )}
      </div>
    );
  },
);

MarkdownInput.displayName = "MarkdownInput";

export default memo(MarkdownInput);
