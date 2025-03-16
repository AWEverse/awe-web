import {
  RefObject,
  ChangeEvent,
  FC,
  useLayoutEffect,
  memo,
  useRef,
  useCallback,
  KeyboardEvent,
} from "react";
import buildClassName from "../lib/buildClassName";
import { useRefInstead } from "@/shared/hooks/base";
import { requestMutation, requestNextMutation } from "@/lib/modules/fastdom";
import useUniqueId from "@/lib/hooks/utilities/useUniqueId";
import "./TextArea.scss";
import { useThrottledFunction } from "../hooks/shedulers";
import { noop } from "@/lib/utils/listener";

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
  maxLines = 5,
  onChange,
  replaceNewlines = false,
  ...rest
}) => {
  const uuid = useUniqueId("text-area", id);
  const textareaRef = useRefInstead<HTMLTextAreaElement>(ref);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const resizerCallbackRef = useRef<NoneToVoidFunction>(noop);

  const lang = navigator.language;

  const fullClassName = buildClassName(
    "input-group",
    error ? "error" : success && "success",
    (disabled || readOnly) && "disabled",
    label && "with-label",
    className,
  );

  const errorId = `${uuid}-error`;
  const successId = `${uuid}-success`;

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    resizerCallbackRef.current = createResizeHeightUpdater(textarea);

    requestNextMutation(() => {
      const scrollHeight = textarea.scrollHeight;

      return () => {
        textarea.style.maxHeight = `${scrollHeight * maxLines}px`;
        resizerCallbackRef.current?.();
      };
    });

    return () => {
      textarea.style.maxHeight = "";
      textarea.value = "";
    };
  }, [maxLines, textareaRef]);

  const resizeHeight = useThrottledFunction(
    () => {
      requestMutation(() => resizerCallbackRef.current());
    },
    250,
    true,
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      const target = e.currentTarget;
      const updatedValue = target.value;
      const valueLength = updatedValue.length;

      if (maxLengthIndicator && indicatorRef.current && maxLengthCount) {
        indicatorRef.current.textContent =
          valueLength > 0
            ? `Characters remaining: ${maxLengthCount - valueLength}`
            : "";
      }

      const valueLengthTrimmed = updatedValue.trim().length;

      if (1 >= valueLengthTrimmed) {
        requestMutation(() => {
          if (textareaRef.current) {
            textareaRef.current.classList.toggle(
              "touched",
              valueLengthTrimmed > 0,
            );
          }
        });
      }

      resizeHeight();

      onChange?.(e);
    },
    [maxLengthCount, maxLengthIndicator, onChange, resizeHeight],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (replaceNewlines && e.key === "Enter") {
        e.preventDefault();
        const target = e.currentTarget;
        const newValue = target.value + " ";
        onChange?.({
          ...e,
          target: { ...target, value: newValue },
          currentTarget: { ...target, value: newValue },
        });
      }
    },
    [replaceNewlines, onChange],
  );

  return (
    <div className={fullClassName} dir={lang === "ar" ? "rtl" : undefined}>
      {label && <label htmlFor={uuid}>{label}</label>}

      <textarea
        id={uuid}
        ref={textareaRef}
        aria-label={label}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : success ? successId : undefined}
        autoComplete={autoComplete}
        className="form-control text-area awe-scrollbar"
        dir="auto"
        disabled={disabled}
        inputMode={inputMode}
        maxLength={maxLengthCount}
        placeholder={placeholder}
        readOnly={readOnly}
        tabIndex={tabIndex}
        value={value || undefined}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        {...rest}
      />

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

function createResizeHeightUpdater(element: HTMLTextAreaElement) {
  const computedStyle = window.getComputedStyle(element);
  const isBorderBox = computedStyle.boxSizing === "border-box";
  const borderTop = parseFloat(computedStyle.borderTopWidth);
  const borderBottom = parseFloat(computedStyle.borderBottomWidth);
  const paddingTop = parseFloat(computedStyle.paddingTop);
  const paddingBottom = parseFloat(computedStyle.paddingBottom);

  return () => {
    element.style.height = "0";

    requestNextMutation(() => {
      const maxHeight = parseFloat(element.style.maxHeight) || 0;
      const { scrollHeight } = element;

      return () => {
        const newHeight = isBorderBox
          ? scrollHeight + borderTop + borderBottom
          : scrollHeight - paddingTop - paddingBottom;

        element.style.height = `${newHeight}px`;
        element.style.overflow = newHeight > maxHeight ? "auto" : "hidden";
      };
    });
  };
}

export default memo(TextArea);
