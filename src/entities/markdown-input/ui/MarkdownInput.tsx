import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import MarkdownIt from "markdown-it";
import DOMPurify from "dompurify";
import s from "./MarkdownInput.module.scss";
import { requestMutation, requestNextMutation } from "@/lib/modules/fastdom";
import { useStableCallback } from "@/shared/hooks/base";
import buildClassName from "@/shared/lib/buildClassName";
import useMarkdownInput from "../hooks/useMarkdownInput";
import Placeholder from "@/shared/ui/Placeholder";
import type { MarkdownOutput } from "../lib/markdownInput.types";
import { parseMarkdownToOutput } from "../lib/engine/parser/parseMarkdownToOutput";
import handlePaste from "./handlers/handlePaste";
import handleKeyDown from "./handlers/handleKeyDown";
import handleSelect from "./handlers/handleSelect";

export interface MarkdownInputProps {
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
  onSubmit?: (value: string | MarkdownOutput) => void;
  onSelectionChange?: (value: string) => void;
  onSelect?: (value: string) => void;
  onSelectionEnd?: (value: string) => void;
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
      onSelect,
      onSelectionEnd,
      onSelectionChange,
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
      validate = (val) => val.length > 0, // Default validation
      id,
      ariaLabel = "Markdown text input",
      required = false,
      enableTabCharacter = true,
      tabSize = 2,
      isStylesRemoved = false,
    },
    ref,
  ) => {
    const editorRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => editorRef.current as HTMLDivElement, []);

    const { text, error, handleTextChange, handleSubmit } = useMarkdownInput({
      value,
      sanitizeFn: sanitizeFn || ((val) => DOMPurify.sanitize(val)),
      validate,
      maxLength,
      clearOnSubmit,
      submitOnCtrlEnter,
      submitKey,
      onChange,
      onSubmit: onSubmit
        ? (v) => {
            (async () => {
              const parsed = await parseMarkdownToOutput(v);
              onSubmit(parsed);
            })();
          }
        : undefined,
    });

    const [isFocused, setIsFocused] = React.useState(false);

    useEffect(() => {
      if (editorRef.current && editorRef.current.textContent !== text) {
        requestMutation(() => {
          if (editorRef.current) editorRef.current.textContent = text;
        });
      }
    }, [text]);

    useEffect(() => {
      if (autoFocus && editorRef.current && !disabled) {
        requestMutation(() => {
          editorRef.current?.focus();
        });
      }
    }, [autoFocus, disabled]);

    const onInput = useCallback(
      (e: React.FormEvent<HTMLDivElement>) => {
        handleTextChange(e.currentTarget.textContent || "");
      },
      [handleTextChange],
    );

    const onKeyDown = useStableCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        handleKeyDown(e, {
          submitKey,
          submitOnCtrlEnter,
          handleSubmit,
          enableTabCharacter,
          tabSize,
        });
      },
    );

    const onPaste = useStableCallback(
      (e: React.ClipboardEvent<HTMLDivElement>) => {
        handlePaste(e);
        handleTextChange(editorRef.current?.textContent || "");
      },
    );

    const handleSelected = useStableCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        handleSelect(e, {
          onSelect: onSelect || (() => {}),
          enableSelection: true,
        });
        if (onSelectionChange) {
          onSelectionChange(editorRef.current?.textContent || "");
        }
      },
    );

    const md = useMemo(
      () =>
        new MarkdownIt({
          html: false,
          linkify: true,
          typographer: true,
        }),
      [],
    );

    const previewHTML = useMemo(
      () =>
        renderMarkdown && text
          ? DOMPurify.sanitize(md.renderInline(text), {
              ALLOWED_TAGS: ["strong", "em", "code", "a", "br"],
              ALLOWED_ATTR: ["href"],
              FORBID_TAGS: ["script", "iframe"],
              FORCE_BODY: true,
            })
          : "",
      [renderMarkdown, text, md],
    );

    return (
      <div
        className={buildClassName(!isStylesRemoved && s.container, className)}
        style={{
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
          data-disabled={disabled}
          className={buildClassName(!isStylesRemoved && s.editor, className)}
          onInput={onInput}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          onSelect={handleSelected}
          onMouseUp={useCallback(() => {
            if (onSelectionEnd) {
              requestNextMutation(() => {
                onSelectionEnd(editorRef.current?.textContent || "");
              });
            }
          }, [onSelectionEnd])}
          onFocus={() => {
            setIsFocused(true);
            requestMutation(() => {
              editorRef.current?.classList.add(s.focused);
            });
          }}
          onBlur={() => {
            setIsFocused(false);
            requestMutation(() => {
              editorRef.current?.classList.remove(s.focused);
            });
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
