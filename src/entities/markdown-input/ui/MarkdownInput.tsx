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

export interface MarkdownInputProps {
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
  onSubmit?: (value: string | MarkdownOutput) => void;
  onSelectionChange?: (value: string) => void;
  onSelect?: (value: string) => void;
  onSelectionEnd?: (value: string) => void;
  onInject?: (type: MarkdownElementType, value: string) => void;
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
      onInject,
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
      validate = (val) => val.length > 0,
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
    const [isFocused, setIsFocused] = React.useState(false);

    // Initialize MarkdownIt instance
    const md = useMemo(
      () =>
        new MarkdownIt({
          html: false,
          linkify: true,
          typographer: true,
        }),
      [],
    );

    // Custom hook to manage input state and validation
    const { text, error, handleTextChange } = useMarkdownInput({
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
            parseMarkdownToOutput(v).then((parsed) => {
              onSubmit(parsed);
            });
          }
        : undefined,
    }); // Sync editor content with state (only when not focused to avoid conflicts)
    useEffect(() => {
      const editor = editorRef.current;
      if (!editor || isFocused) return;

      if (renderMarkdown) {
        const html = DOMPurify.sanitize(md.render(text), {
          ALLOWED_TAGS: [
            "p",
            "strong",
            "em",
            "code",
            "a",
            "br",
            "ul",
            "ol",
            "li",
            "blockquote",
            "h1",
            "h2",
            "h3",
            "h4",
            "h5",
            "h6",
            "hr",
            "table",
            "thead",
            "tbody",
            "tr",
            "th",
            "td",
          ],
          ALLOWED_ATTR: ["href", "title"],
        });
        requestMutation(() => {
          editor.innerHTML = html;
        });
      } else if (editor.textContent !== text) {
        requestMutation(() => {
          editor.textContent = text;
        });
      }
    }, [text, isFocused, renderMarkdown, md]);

    // Auto focus on mount
    useEffect(() => {
      if (autoFocus && editorRef.current && !disabled) {
        requestMutation(() => {
          editorRef.current?.focus();
        });
      }
    }, [autoFocus, disabled]);

    const getPlainText = useCallback(
      (el: HTMLElement) => el.innerText || el.textContent || "",
      [],
    ); // Inject Markdown formatting (optimized version)
    const injectMarkdown = useCallback(
      (type: MarkdownElementType, value?: string) => {
        const editor = editorRef.current;
        if (!editor) return;

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        let selectedText = selection.toString();
        if (!selectedText && value) selectedText = value;

        // Allow empty selection for certain types
        if (
          !selectedText &&
          !["horizontalRule", "table", "list"].includes(type)
        )
          return;

        let markdown = selectedText || "";

        // Optimize switch with grouped cases
        switch (type) {
          case "bold":
            markdown = `**${markdown}**`;
            break;
          case "italic":
            markdown = `*${markdown}*`;
            break;
          case "code":
            markdown = markdown.includes("\n")
              ? `\`\`\`\n${markdown}\n\`\`\``
              : `\`${markdown}\``;
            break;
          case "heading":
            markdown = `# ${markdown}`;
            break;
          case "blockquote":
            markdown = `> ${markdown.split("\n").join("\n> ")}`;
            break;
          case "link": {
            const url = prompt("Enter URL:") || "#";
            markdown = `[${markdown}](${url})`;
            break;
          }
          case "image": {
            const url = prompt("Enter image URL:") || "#";
            const alt = markdown || "Image";
            markdown = `![${alt}](${url})`;
            break;
          }
          case "list":
          case "listItem":
            markdown = markdown
              ? markdown
                  .split("\n")
                  .map((line) => `- ${line}`)
                  .join("\n")
              : "- ";
            break;
          case "horizontalRule":
            markdown = "---";
            break;
          case "mention":
            markdown = `@${markdown}`;
            break;
          case "hashtag":
            markdown = `#${markdown}`;
            break;
          case "emoji":
            markdown = `:${markdown}:`;
            break;
          case "table":
            markdown =
              "| Header 1 | Header 2 |\n| --- | --- |\n| Cell 1 | Cell 2 |";
            break;
          default:
            markdown = markdown;
            break;
        }

        // Insert as plain text instead of HTML to maintain consistency
        range.deleteContents();
        range.insertNode(document.createTextNode(markdown));

        // Restore selection and update state
        selection.collapseToEnd();
        handleTextChange(getPlainText(editor));
      },
      [handleTextChange, getPlainText],
    );

    // Handle input changes
    const onInput = useCallback(
      (e: React.FormEvent<HTMLDivElement>) => {
        handleTextChange(getPlainText(e.currentTarget));
      },
      [handleTextChange],
    ); // Handle selection changes
    const onSelectHandler = useCallback(() => {
      const sel = window.getSelection();
      const selectedText = sel ? sel.toString() : "";
      if (onSelect) onSelect(selectedText);
      if (onSelectionChange) onSelectionChange(selectedText);
    }, [onSelect, onSelectionChange]);

    // Handle selection end
    const onMouseUpHandler = useCallback(() => {
      if (onSelectionEnd) {
        requestNextMutation(() => {
          onSelectionEnd(editorRef.current?.textContent || "");
        });
      }
    }, [onSelectionEnd]); // Handle paste events (optimized to prevent default and insert plain text only)
    const onPasteHandler = useCallback(
      (e: React.ClipboardEvent<HTMLDivElement>) => {
        e.preventDefault();
        const text = e.clipboardData.getData("text/plain");
        // Use modern approach instead of deprecated execCommand
        if (
          document.queryCommandSupported &&
          document.queryCommandSupported("insertText")
        ) {
          document.execCommand("insertText", false, text);
        } else {
          // Fallback for browsers that don't support execCommand
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(text));
            selection.collapseToEnd();
          }
        }
        requestMutation(() => {
          handleTextChange(getPlainText(e.currentTarget));
        });
      },
      [handleTextChange, getPlainText],
    );

    // Handle keyboard events (memoized with stable dependencies)
    const onKeyDownHandler = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (submitOnCtrlEnter && e.key === "Enter" && e.ctrlKey) {
          e.preventDefault();
          if (onSubmit) onSubmit(text);
        } else if (!submitOnCtrlEnter && e.key === submitKey && !e.shiftKey) {
          e.preventDefault();
          if (onSubmit) onSubmit(text);
        } else if (enableTabCharacter && e.key === "Tab") {
          e.preventDefault();
          const spaces = " ".repeat(tabSize);
          if (
            document.queryCommandSupported &&
            document.queryCommandSupported("insertText")
          ) {
            document.execCommand("insertText", false, spaces);
          } else {
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              range.deleteContents();
              range.insertNode(document.createTextNode(spaces));
              selection.collapseToEnd();
            }
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
      ],
    ); // Handle focus and blur (optimized for markdown rendering)
    const onFocusHandler = useCallback(() => {
      setIsFocused(true);
      const editor = editorRef.current;
      if (editor && renderMarkdown) {
        // Convert from HTML back to plain text when focusing
        requestMutation(() => {
          editor.textContent = text;
          // Position cursor at end
          const range = document.createRange();
          const selection = window.getSelection();
          if (selection) {
            range.selectNodeContents(editor);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
          }
        });
      }
    }, [text, renderMarkdown]);

    const onBlurHandler = useCallback(() => {
      setIsFocused(false);
      // Content will be re-rendered as HTML via useEffect when isFocused becomes false
    }, []);

    // Expose editor ref
    useImperativeHandle(ref, () => editorRef.current as HTMLDivElement, []);

    // Expose injectMarkdown function
    useEffect(() => {
      if (onInject) {
        onInject(injectMarkdown as any, "expose");
      }
    }, [onInject, injectMarkdown]);

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
          aria-describedby={error ? "error-message" : undefined}
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
      </div>
    );
  },
);

MarkdownInput.displayName = "MarkdownInput";

export default memo(MarkdownInput);
