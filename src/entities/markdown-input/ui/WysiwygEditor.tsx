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

import s from "./MarkdownInput.module.scss";
import { useStableCallback } from "@/shared/hooks/base";
import buildClassName from "@/shared/lib/buildClassName";
import { useDebouncedFunction } from "@/shared/hooks/shedulers";
import { MarkdownElementType } from "@/shared/markdown/public/MarkdownTypes";
import CursorManager from "../lib/CursorManager";
import HistoryManager from "../lib/HistoryManager";
import MarkdownInjector from "../lib/MarkdownInjector";
import MarkdownProcessor from "../lib/MarkdownProcessor";
import PerformanceOptimizer from "../lib/PerformanceOptimizer";

interface MarkdownInputProps {
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  onSelect?: (text: string) => void;
  onSelectionChange?: (text: string) => void;
  onSelectionEnd?: (value: string) => void;
  onInject?: (inject: (type: MarkdownElementType) => void) => void;
  className?: string;
  maxLength?: number;
  autoFocus?: boolean;
  minHeight?: number;
  maxHeight?: number;
  containerStyle?: React.CSSProperties;
  inputStyle?: React.CSSProperties;
  renderMarkdown?: boolean;
  actions?: React.ReactNode;
  sanitizeFn?: (text: string) => string;
  clearOnSubmit?: boolean;
  submitOnCtrlEnter?: boolean;
  submitKey?: string;
  showCharCount?: boolean;
  validate?: (text: string) => boolean | string;
  id?: string;
  ariaLabel?: string;
  required?: boolean;
  enableTabCharacter?: boolean;
  tabSize?: number;
  isStylesRemoved?: boolean;
}

interface WysiwygEditorRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  insertText: (text: string) => void;
  getSelection: () => string;
  undo: () => void;
  redo: () => void;
  injectMarkdown: (type: MarkdownElementType) => void;
  getMarkdownText: () => string;
}

// Мок для Placeholder
const Placeholder: React.FC<{
  className?: string;
  showText: boolean;
  children: React.ReactNode;
}> = ({ className, showText, children }) => {
  if (!showText) return null;

  return (
    <div
      className={className}
      style={{
        position: "absolute",
        color: "#999",
        pointerEvents: "none",
        fontSize: 16,
        lineHeight: 1.5,
      }}
    >
      {children}
    </div>
  );
};

const WysiwygEditor = forwardRef<WysiwygEditorRef, MarkdownInputProps>(
  (
    {
      value = "",
      placeholder = "Type your message...",
      disabled = false,
      onChange,
      onSubmit,
      onSelect,
      onSelectionChange,
      onSelectionEnd,
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
      validate = () => true,
      id,
      ariaLabel = "WYSIWYG Markdown editor",
      required = false,
      enableTabCharacter = true,
      tabSize = 2,
      isStylesRemoved = false,
    },
    ref,
  ) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [isComposing, setIsComposing] = useState(false);
    const [markdownValue, setMarkdownValue] = useState(value);
    const isUpdatingFromProp = useRef(false);

    const historyManager = useMemo(() => new HistoryManager(), []);

    // ИСПРАВЛЕНО: стабильный обработчик изменений с мемоизацией
    const handleContentChange = useStableCallback((newContent: string) => {
      if (isComposing || isUpdatingFromProp.current) return;

      const sanitized = sanitizeFn ? sanitizeFn(newContent) : newContent;
      const processed = sanitized.replace(/\r\n|\r/g, "\n");

      // Проверяем максимальную длину
      if (maxLength !== undefined && processed.length > maxLength) {
        return;
      }

      setMarkdownValue(processed);
      onChange?.(processed);
    });

    // ИСПРАВЛЕНО: Мемоизация для производительности
    const memoizedHtmlContent = useMemo(() => {
      return renderMarkdown
        ? MarkdownProcessor.markdownToHtml(markdownValue)
        : markdownValue;
    }, [markdownValue, renderMarkdown]);

    // Валидация с мемоизацией
    const error = useMemo(() => {
      const result = validate(markdownValue);
      return typeof result === "string" ? result : undefined;
    }, [markdownValue, validate]);

    // ИСПРАВЛЕНО: инжект markdown
    const injectNode = useCallback(
      (type: MarkdownElementType) => {
        if (disabled || !editorRef.current) return;

        const editor = editorRef.current;

        PerformanceOptimizer.scheduleWrite(() => {
          if (document.activeElement !== editor) {
            editor.focus();
          }
        });

        PerformanceOptimizer.scheduleRead(() => {
          const [from, to] = CursorManager.getSelectedRange(editor);
          const currentMarkdown = MarkdownProcessor.domToMarkdown(editor);

          const { innerText, innerHTML } = MarkdownInjector.inject(
            type,
            currentMarkdown,
            from,
            to,
            renderMarkdown,
          );

          PerformanceOptimizer.scheduleWrite(() => {
            if (renderMarkdown && innerHTML) {
              editor.innerHTML = innerHTML;
            } else {
              const htmlContent = MarkdownProcessor.markdownToHtml(innerText);
              editor.innerHTML = htmlContent || innerText;
            }

            handleContentChange(innerText);

            const newCursorPos =
              from + (innerText.length - currentMarkdown.length);
            CursorManager.setCursorPosition(editor, Math.max(0, newCursorPos));
          });
        });
      },
      [disabled, renderMarkdown, handleContentChange],
    );

    // Публичное API
    useImperativeHandle(
      ref,
      () => ({
        focus: () => {
          PerformanceOptimizer.scheduleWrite(() => {
            editorRef.current?.focus();
          });
        },
        blur: () => {
          PerformanceOptimizer.scheduleWrite(() => {
            editorRef.current?.blur();
          });
        },
        clear: () => {
          PerformanceOptimizer.scheduleWrite(() => {
            if (editorRef.current) {
              editorRef.current.innerHTML = "";
              setMarkdownValue("");
              handleContentChange("");
            }
          });
        },
        insertText: (text: string) => {
          PerformanceOptimizer.scheduleWrite(() => {
            if (editorRef.current) {
              const currentPos = CursorManager.getCursorPosition(
                editorRef.current,
              );
              const currentMarkdown = MarkdownProcessor.domToMarkdown(
                editorRef.current,
              );
              const newMarkdown =
                currentMarkdown.slice(0, currentPos) +
                text +
                currentMarkdown.slice(currentPos);

              const htmlContent = MarkdownProcessor.markdownToHtml(newMarkdown);
              editorRef.current.innerHTML = htmlContent;
              handleContentChange(newMarkdown);
              CursorManager.setCursorPosition(
                editorRef.current,
                currentPos + text.length,
              );
            }
          });
        },
        getSelection: () => CursorManager.getSelectedText(),
        getMarkdownText: () => markdownValue,
        undo: () => {
          const state = historyManager.undo();
          if (state && editorRef.current) {
            PerformanceOptimizer.scheduleWrite(() => {
              if (editorRef.current) {
                const htmlContent = MarkdownProcessor.markdownToHtml(
                  state.content,
                );
                editorRef.current.innerHTML = htmlContent;
                setMarkdownValue(state.content);
                handleContentChange(state.content);
                CursorManager.setCursorPosition(
                  editorRef.current,
                  state.cursorPosition,
                );
              }
            });
          }
        },
        redo: () => {
          const state = historyManager.redo();
          if (state && editorRef.current) {
            PerformanceOptimizer.scheduleWrite(() => {
              if (editorRef.current) {
                const htmlContent = MarkdownProcessor.markdownToHtml(
                  state.content,
                );
                editorRef.current.innerHTML = htmlContent;
                setMarkdownValue(state.content);
                handleContentChange(state.content);
                CursorManager.setCursorPosition(
                  editorRef.current,
                  state.cursorPosition,
                );
              }
            });
          }
        },
        injectMarkdown: injectNode,
      }),
      [handleContentChange, historyManager, injectNode, markdownValue],
    );

    // Установка коллбека инжекта
    useEffect(() => {
      onInject?.(injectNode);
    }, [onInject, injectNode]);

    // ИСПРАВЛЕНО: автофокус с проверками
    useEffect(() => {
      if (autoFocus && !disabled && editorRef.current) {
        PerformanceOptimizer.scheduleWrite(() => {
          editorRef.current?.focus();
        });
      }
    }, [autoFocus, disabled]);

    // ИСПРАВЛЕНО: обработчик ввода
    const onInput = useCallback(
      (e: React.FormEvent<HTMLDivElement>) => {
        if (isComposing || !editorRef.current) return;

        try {
          const element = e.currentTarget;
          const markdownText = MarkdownProcessor.domToMarkdown(element);
          const cursorPos = CursorManager.getCursorPosition(element);

          if (historyManager.canSave(markdownText, markdownValue)) {
            historyManager.save(markdownValue, cursorPos);
          }

          handleContentChange(markdownText);
        } catch (error) {
          console.warn("Input processing failed:", error);
          const fallbackText = e.currentTarget.textContent || "";
          handleContentChange(fallbackText);
        }
      },
      [handleContentChange, markdownValue, historyManager, isComposing],
    );

    // ИСПРАВЛЕНО: обработчик вставки с проверками безопасности
    const onPasteHandler = useCallback(
      (e: React.ClipboardEvent<HTMLDivElement>) => {
        e.preventDefault();

        const selection = window.getSelection();
        if (!selection?.rangeCount || !editorRef.current) return;

        try {
          const clipboardData = e.clipboardData;
          const htmlData = clipboardData.getData("text/html");
          const textData = clipboardData.getData("text/plain");

          let content = textData;
          if (htmlData) {
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = htmlData;
            content = MarkdownProcessor.domToMarkdown(tempDiv);
          }

          PerformanceOptimizer.scheduleWrite(() => {
            const range = selection.getRangeAt(0);
            if (!range) return;

            range.deleteContents();

            if (renderMarkdown) {
              const htmlContent = MarkdownProcessor.markdownToHtml(content);
              const tempDiv = document.createElement("div");
              tempDiv.innerHTML = htmlContent;

              const fragment = document.createDocumentFragment();
              while (tempDiv.firstChild) {
                fragment.appendChild(tempDiv.firstChild);
              }
              range.insertNode(fragment);
            } else {
              range.insertNode(document.createTextNode(content));
            }

            selection.collapseToEnd();

            if (editorRef.current) {
              handleContentChange(
                MarkdownProcessor.domToMarkdown(editorRef.current),
              );
            }
          });
        } catch (error) {
          console.warn("Paste operation failed:", error);
        }
      },
      [handleContentChange, renderMarkdown],
    );

    // Enhanced keyboard handler with proper indentation
    const onKeyDownHandler = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        const editor = editorRef.current;
        if (!editor) return;

        // Handle Tab for indentation
        if (e.key === "Tab" && enableTabCharacter) {
          e.preventDefault();

          const currentMarkdown = MarkdownProcessor.domToMarkdown(editor);
          const cursorPos = CursorManager.getCursorPosition(editor);

          const { newText, newCursorPos } = MarkdownProcessor.handleIndentation(
            currentMarkdown,
            cursorPos,
            e.shiftKey,
          );

          const htmlContent = MarkdownProcessor.markdownToHtml(newText);
          editor.innerHTML = htmlContent;
          handleContentChange(newText);
          CursorManager.setCursorPosition(editor, newCursorPos);
          return;
        }

        // Handle markdown shortcuts
        if (e.ctrlKey || e.metaKey) {
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

          // Header shortcuts (Ctrl+1-6)
          if (/^[1-6]$/.test(e.key)) {
            e.preventDefault();
            const headerType = `heading${e.key}` as MarkdownElementType;
            injectNode(headerType);
            return;
          }

          // Undo/Redo
          if (e.key === "z" && !e.shiftKey) {
            e.preventDefault();
            const state = historyManager.undo();
            if (state) {
              const htmlContent = MarkdownProcessor.markdownToHtml(
                state.content,
              );
              editor.innerHTML = htmlContent;
              setMarkdownValue(state.content);
              handleContentChange(state.content);
              CursorManager.setCursorPosition(editor, state.cursorPosition);
            }
            return;
          }

          if ((e.key === "z" && e.shiftKey) || e.key === "y") {
            e.preventDefault();
            const state = historyManager.redo();
            if (state) {
              const htmlContent = MarkdownProcessor.markdownToHtml(
                state.content,
              );
              editor.innerHTML = htmlContent;
              setMarkdownValue(state.content);
              handleContentChange(state.content);
              CursorManager.setCursorPosition(editor, state.cursorPosition);
            }
            return;
          }
        }

        // Handle submission
        if (submitOnCtrlEnter && e.key === "Enter" && e.ctrlKey) {
          e.preventDefault();
          onSubmit?.(markdownValue);
          if (clearOnSubmit) {
            editor.innerHTML = "";
            setMarkdownValue("");
            handleContentChange("");
          }
        } else if (!submitOnCtrlEnter && e.key === submitKey && !e.shiftKey) {
          e.preventDefault();
          onSubmit?.(markdownValue);
          if (clearOnSubmit) {
            editor.innerHTML = "";
            setMarkdownValue("");
            handleContentChange("");
          }
        }
      },
      [
        injectNode,
        historyManager,
        handleContentChange,
        onSubmit,
        markdownValue,
        submitOnCtrlEnter,
        submitKey,
        clearOnSubmit,
        enableTabCharacter,
      ],
    );

    // Selection handlers with debouncing
    const debouncedSelectionHandler = useDebouncedFunction(
      () => {
        const selectedText = CursorManager.getSelectedText();
        onSelect?.(selectedText);
        onSelectionChange?.(selectedText);
      },
      100,
      false,
      false,
      [onSelect, onSelectionChange],
    );

    const onSelectHandler = useCallback(() => {
      debouncedSelectionHandler();
    }, [debouncedSelectionHandler]);

    const onMouseUpHandler = useCallback(() => {
      if (onSelectionEnd) {
        PerformanceOptimizer.scheduleRead(() => {
          onSelectionEnd?.(markdownValue);
        });
      }
    }, [onSelectionEnd, markdownValue]);

    // Focus handlers
    const onFocusHandler = useStableCallback(() => setIsFocused(true));
    const onBlurHandler = useStableCallback(() => setIsFocused(false));

    // Composition handlers for IME support
    const onCompositionStart = useStableCallback(() => setIsComposing(true));
    const onCompositionEnd = useCallback(() => {
      setIsComposing(false);
      // Handle final composition result
      if (editorRef.current) {
        const markdownText = MarkdownProcessor.domToMarkdown(editorRef.current);
        handleContentChange(markdownText);
      }
    }, [handleContentChange]);

    // ИСПРАВЛЕНО: Синхронизация внешнего значения без бесконечного цикла
    useEffect(() => {
      if (value !== markdownValue && !isUpdatingFromProp.current) {
        isUpdatingFromProp.current = true;

        PerformanceOptimizer.scheduleWrite(() => {
          if (editorRef.current) {
            const htmlContent = renderMarkdown
              ? MarkdownProcessor.markdownToHtml(value)
              : value;

            editorRef.current.innerHTML = htmlContent;
            setMarkdownValue(value);

            const currentPos = CursorManager.getCursorPosition(
              editorRef.current,
            );
            CursorManager.setCursorPosition(
              editorRef.current,
              Math.min(currentPos, value.length),
            );
          }

          isUpdatingFromProp.current = false;
        });
      }
    }, [value, renderMarkdown]); // Убрана markdownValue из зависимостей

    return (
      <div
        className={buildClassName(!isStylesRemoved && s.container, className)}
        style={{ ...containerStyle, direction: "ltr" }}
        data-error={!!error}
      >
        <Placeholder
          className={s.placeholder}
          showText={!isFocused && !markdownValue}
        >
          {placeholder}
        </Placeholder>

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
          aria-multiline="true"
          aria-describedby={error ? `${id}-error-message` : undefined}
          className={buildClassName(
            !isStylesRemoved && s.editor,
            isFocused && s.focused,
          )}
          onInput={onInput}
          onSelect={onSelectHandler}
          onMouseUp={onMouseUpHandler}
          onPaste={onPasteHandler}
          onKeyDown={onKeyDownHandler}
          onFocus={onFocusHandler}
          onBlur={onBlurHandler}
          onCompositionStart={onCompositionStart}
          onCompositionEnd={onCompositionEnd}
          style={{
            minHeight,
            maxHeight,
            overflowY: "auto",
            padding: "12px 16px",
            borderRadius: 20,
            background: "var(--awe-palette-background-paper)",
            fontSize: 16,
            lineHeight: 1.5,
            wordWrap: "break-word",
            overflowWrap: "break-word",
            ...inputStyle,
          }}
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
            className={buildClassName(!isStylesRemoved && s.charCount)}
            aria-live="polite"
          >
            {maxLength - markdownValue.length} characters remaining
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

WysiwygEditor.displayName = "WysiwygEditor";

export default memo(WysiwygEditor);
export type { WysiwygEditorRef };
