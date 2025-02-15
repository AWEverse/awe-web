import {
  RefObject,
  ChangeEvent,
  FC,
  useLayoutEffect,
  memo,
  useRef,
} from "react";
import buildClassName from "../lib/buildClassName";
import { useRefInstead } from "@/shared/hooks/base";
import {
  requestMutation,
  requestNextMutation,
} from "@/lib/modules/fastdom/fastdom";
import { useStableCallback } from "@/shared/hooks/base";
import useUniqueId from "@/lib/hooks/utilities/useUniqueId";

import "./TextArea.scss";
import { throttle } from "@/lib/core";

type TextAreaProps = React.DetailedHTMLProps<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  HTMLTextAreaElement
>;

type OwnProps = {
  ref?: RefObject<HTMLTextAreaElement>;
  label?: string;
  error?: string;
  success?: string;
  maxLength?: number;
  maxLines?: number;
  maxLengthIndicator?: boolean;
  replaceNewlines?: boolean;
} & TextAreaProps;

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
  maxLength,
  maxLengthIndicator,
  tabIndex,
  maxLines = 5,
  onChange,
  onInput,
  onKeyDown,
  onBlur,
  onPaste,
  replaceNewlines = false,
  ...rest
}) => {
  const uuid = useUniqueId("text-area", id);
  const textareaRef = useRefInstead<HTMLTextAreaElement>(ref);
  const indicatorRef = useRef<HTMLDivElement>(null);

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

    textarea.style.maxHeight = `${textarea.scrollHeight * maxLines}px`;
    resizeHeight(textarea);
  }, [maxLines, textareaRef]);

  const resizeHeight = useStableCallback(
    throttle(
      (element: HTMLTextAreaElement) => {
        requestMutation(() => {
          element.style.height = "0";

          requestNextMutation(() => {
            const maxHeight = parseFloat(element.style.maxHeight) || 0;
            const newHeight = element.scrollHeight;

            return () => {
              element.style.height = `${newHeight}px`;
              element.style.overflow =
                maxHeight < newHeight ? "auto" : "hidden";
            };
          });
        });
      },
      200,
      true,
    ),
  );

  const handleChange = useStableCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      const target = e.currentTarget;

      let updatedValue = target.value.trim();

      if (replaceNewlines) {
        const previousSelectionEnd = target.selectionEnd;
        updatedValue = updatedValue.replace(/\n/g, " ");
        target.value = updatedValue;
        target.selectionEnd = previousSelectionEnd;
      }

      const valueLength = updatedValue.length;

      if (maxLengthIndicator && indicatorRef.current) {
        indicatorRef.current.textContent =
          valueLength > 0 ? `${valueLength}/${maxLength}` : "";
      }

      if (1 <= valueLength) {
        requestMutation(() => {
          if (textareaRef.current) {
            textareaRef.current.classList.toggle("touched", valueLength > 0);
          }
        });
      }

      resizeHeight(target);

      onChange?.({
        ...e,
        target: { ...e.target, value: updatedValue },
        currentTarget: { ...e.currentTarget, value: updatedValue },
      });
    },
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
        maxLength={maxLength}
        placeholder={placeholder}
        readOnly={readOnly}
        tabIndex={tabIndex}
        value={value || undefined}
        onBlur={onBlur}
        onChange={handleChange}
        onInput={onInput}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
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

      {maxLength && maxLengthIndicator && (
        <div ref={indicatorRef} className="max-length-indicator" />
      )}
    </div>
  );
};

export default memo(TextArea);
