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
import MarkdownIt from "markdown-it";
import DOMPurify from "dompurify";
import { requestMutation, requestNextMutation } from "@/lib/modules/fastdom";
import buildClassName from "@/shared/lib/buildClassName";
import useMarkdownInput from "../hooks/useMarkdownInput";
import Placeholder from "@/shared/ui/Placeholder";
import type {
  MarkdownElementType,
  MarkdownOutput,
} from "../lib/markdownInput.types";
import { parseMarkdownToOutput } from "../lib/engine/parser/parseMarkdownToOutput";
import s from "./MarkdownInput.module.scss";
import CursorManager from "../lib/CursorManager";
import HistoryManager from "../lib/HistoryManager";
import MarkdownInjector, { DOMPURIFY_CONFIG } from "../lib/MarkdownInjector";
import { useStableCallback } from "@/shared/hooks/base";

export interface MarkdownInputProps {
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
  onSubmit?: (value: string | MarkdownOutput) => void;
  onSelectionChange?: (value: string) => void;
  onSelect?: (value: string) => void;
  onSelectionEnd?: (value: string) => void;
  onInject?: (
    injectNode: (type: MarkdownElementType) => void,
    action: string,
  ) => void;
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

const MARKDOWN_IT_CONFIG = {
  html: true,
  linkify: true,
  typographer: true,
};

const MarkdownInput = forwardRef<HTMLDivElement, MarkdownInputProps>(
  (
    {
      value = "",
      placeholder = "Type your message...",
      disabled = false,
      onChange,
      onSubmit,
      onSelect,
      onSelectionEnd,
      onSelectionChange,
      onInject,
      className,
      maxLength,
      autoFocus = false,
      minHeight = 40,
      maxHeight = 200,
      containerStyle = {},
      inputStyle = {},
      renderMarkdown = true,
      actions,
      sanitizeFn,
      clearOnSubmit = false,
      submitOnCtrlEnter = false,
      submitKey = "Enter",
      showCharCount = false,
      validate = () => true, // Fixed: provide default validation function
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
    const [isFocused, setIsFocused] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    const historyManager = useMemo(() => new HistoryManager(), []);
    const md = useMemo(() => new MarkdownIt(MARKDOWN_IT_CONFIG), []);

    // Memoized sanitization function
    const sanitize = useMemo(
      () =>
        sanitizeFn ||
        ((val: string) => DOMPurify.sanitize(val, DOMPURIFY_CONFIG)),
      [sanitizeFn],
    );

    // Custom hook with optimized handling
    const { text, error, handleTextChange } = useMarkdownInput({
      value,
      sanitizeFn: sanitize,
      validate,
      maxLength,
      clearOnSubmit,
      submitOnCtrlEnter,
      submitKey,
      onChange,
      onSubmit: onSubmit
        ? (v) => {
            // Handle async parsing properly
            if (typeof v === "string") {
              parseMarkdownToOutput(v)
                .then((parsed) => {
                  onSubmit(parsed);
                })
                .catch((error) => {
                  console.error("Failed to parse markdown:", error);
                  onSubmit(v); // Fallback to string
                });
            } else {
              onSubmit(v);
            }
          }
        : undefined,
    });

    // Optimized function to get text
    const getPlainText = useStableCallback(
      (el: HTMLElement): string => el.textContent || "",
    );

    const injectNode = useCallback(
      (type: MarkdownElementType) => {
        const editor = editorRef.current;
        if (!editor || disabled) return;

        if (document.activeElement !== editor) {
          editor.focus();
        }

        const selectedText = CursorManager.getSelectedText();
        const cursorPos = CursorManager.getCursorPosition(editor);

        historyManager.save(text, cursorPos);

        MarkdownInjector.inject(type, selectedText, renderMarkdown);

        requestMutation(() => {
          handleTextChange(getPlainText(editor));
        });
      },
      [
        disabled,
        text,
        renderMarkdown,
        handleTextChange,
        getPlainText,
        historyManager,
      ],
    );

    useEffect(() => {
      const editor = editorRef.current;
      if (!editor || isFocused) return;

      requestMutation(() => {
        if (renderMarkdown && text) {
          const html = DOMPurify.sanitize(md.render(text), DOMPURIFY_CONFIG);

          if (editor.innerHTML !== html) {
            editor.innerHTML = html;
          }
        } else if (editor.textContent !== text) {
          editor.textContent = text;
        }

        if (!isInitialized) {
          setIsInitialized(true);
        }
      });
    }, [text, isFocused, renderMarkdown, md, isInitialized]);

    useEffect(() => {
      if (autoFocus && editorRef.current && !disabled && isInitialized) {
        requestMutation(() => {
          editorRef.current?.focus();
        });
      }
    }, [autoFocus, disabled, isInitialized]);

    const onInput = useCallback(
      (e: React.FormEvent<HTMLDivElement>) => {
        const newContent = getPlainText(e.currentTarget);
        const cursorPos = CursorManager.getCursorPosition(e.currentTarget);

        // Save to history on significant changes
        if (historyManager.canSave(newContent, text)) {
          historyManager.save(text, cursorPos);
        }

        handleTextChange(newContent);
      },
      [handleTextChange, getPlainText, text, historyManager],
    );

    const onSelectHandler = useCallback(() => {
      const selectedText = CursorManager.getSelectedText();
      onSelect?.(selectedText);
      onSelectionChange?.(selectedText);
    }, [onSelect, onSelectionChange]);

    const onMouseUpHandler = useCallback(() => {
      if (onSelectionEnd) {
        requestNextMutation(() => {
          onSelectionEnd(editorRef.current?.textContent || "");
        });
      }
    }, [onSelectionEnd]);

    const onPasteHandler = useCallback(
      (e: React.ClipboardEvent<HTMLDivElement>) => {
        e.preventDefault();
        const pastedText = e.clipboardData.getData("text/plain");

        const selection = window.getSelection();
        if (selection?.rangeCount) {
          const range = selection.getRangeAt(0);
          range.deleteContents();
          range.insertNode(document.createTextNode(pastedText));
          selection.collapseToEnd();
        }

        requestMutation(() => {
          handleTextChange(getPlainText(e.currentTarget));
        });
      },
      [handleTextChange, getPlainText],
    );

    // Keyboard handler with optimization
    const onKeyDownHandler = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        const editor = editorRef.current;
        if (!editor) return;

        // Undo/Redo
        if (e.ctrlKey || e.metaKey) {
          if (e.key.toLowerCase() === "z" && !e.shiftKey) {
            e.preventDefault();
            const prevState = historyManager.undo();
            if (prevState) {
              editor.textContent = prevState.content;
              handleTextChange(prevState.content);
              CursorManager.setCursorPosition(editor, prevState.cursorPosition);
            }
            return;
          } else if (
            e.key.toLowerCase() === "y" ||
            (e.key.toLowerCase() === "z" && e.shiftKey)
          ) {
            e.preventDefault();
            const nextState = historyManager.redo();
            if (nextState) {
              editor.textContent = nextState.content;
              handleTextChange(nextState.content);
              CursorManager.setCursorPosition(editor, nextState.cursorPosition);
            }
            return;
          }
        }

        // Markdown shortcuts
        if (e.ctrlKey || e.metaKey) {
          const cursorPos = CursorManager.getCursorPosition(editor);
          historyManager.save(getPlainText(editor), cursorPos);

          const shortcuts: Record<string, MarkdownElementType> = {
            b: "bold",
            i: "italic",
            k: "link",
            "`": "code",
            e: "code",
          };

          const shortcut = shortcuts[e.key.toLowerCase()];
          if (shortcut) {
            e.preventDefault();
            injectNode(shortcut);
            return;
          }

          // Headers (Ctrl+1-6)
          if (/^[1-6]$/.test(e.key)) {
            e.preventDefault();
            injectNode("heading");
            return;
          }
        }

        // Handle Enter and Tab
        if (submitOnCtrlEnter && e.key === "Enter" && e.ctrlKey) {
          e.preventDefault();
          onSubmit?.(text);
        } else if (!submitOnCtrlEnter && e.key === submitKey && !e.shiftKey) {
          e.preventDefault();
          onSubmit?.(text);
        } else if (enableTabCharacter && e.key === "Tab") {
          e.preventDefault();
          const spaces = " ".repeat(tabSize);

          // Modern text insertion
          const selection = window.getSelection();
          if (selection?.rangeCount) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(spaces));
            selection.collapseToEnd();
          }
        }
      },
      [
        onSubmit,
        text,
        submitOnCtrlEnter,
        submitKey,
        enableTabCharacter,
        tabSize,
        injectNode,
        handleTextChange,
        getPlainText,
        historyManager,
      ],
    );

    // Focus handlers
    const onFocusHandler = useCallback(() => {
      setIsFocused(true);
      const editor = editorRef.current;
      if (!editor) return;

      const cursorPos = CursorManager.getCursorPosition(editor);
      historyManager.initialize(text, cursorPos);

      if (renderMarkdown) {
        requestMutation(() => {
          editor.textContent = text;
          CursorManager.setEndPosition(editor);
        });
      }
    }, [text, renderMarkdown, historyManager]);

    const onBlurHandler = useStableCallback(() => {
      setIsFocused(false);
    });

    // Expose ref
    useImperativeHandle(ref, () => editorRef.current as HTMLDivElement, []);

    // Expose injectNode
    useEffect(() => {
      onInject?.(injectNode, "expose");
    }, [onInject, injectNode]);

    return (
      <div
        className={buildClassName(!isStylesRemoved && s.container, className)}
        style={{ ...containerStyle, direction: "ltr" }}
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
          aria-describedby={error ? `${id}-error-message` : undefined}
          data-disabled={disabled}
          className={buildClassName(!isStylesRemoved && s.editor, className)}
          onInput={onInput}
          onSelect={onSelectHandler}
          onMouseUp={onMouseUpHandler}
          onPaste={onPasteHandler}
          onKeyDown={onKeyDownHandler}
          onFocus={onFocusHandler}
          onBlur={onBlurHandler}
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
            id={`${id}-error-message`}
            className={buildClassName(!isStylesRemoved && s.errorMessage)}
            role="alert"
            aria-live="polite"
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
      </div>
    );
  },
);

MarkdownInput.displayName = "MarkdownInput";

export default memo(MarkdownInput);
