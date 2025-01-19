// 'use precompile';

import {
  RefObject,
  ChangeEvent,
  FormEvent,
  FC,
  useLayoutEffect,
  memo,
  useState,
  useMemo,
} from "react";
import buildClassName from "../lib/buildClassName";
import useRefInstead from "@/lib/hooks/state/useRefInstead";
import {
  requestMutation,
  requestForcedReflow,
} from "@/lib/modules/fastdom/fastdom";
import useStableCallback from "@/lib/hooks/callbacks/useStableCallback";
import { generateUniqueId } from "@/lib/hooks/utilities/useUniqueId";

import s from "./TextArea.module.scss";

type OwnProps = {
  ref?: RefObject<HTMLTextAreaElement>;
  id?: string;
  className?: string;
  value?: string;
  label?: string;
  error?: string;
  success?: string;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  autoComplete?: string;
  maxLength?: number;
  maxLengthIndicator?: string;
  tabIndex?: number;
  replaceNewlines?: boolean;
  inputMode?:
    | "text"
    | "none"
    | "tel"
    | "url"
    | "email"
    | "numeric"
    | "decimal"
    | "search";
  maxLines?: number;
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onInput?: (e: FormEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onPaste?: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
};

/**
 * TextArea component with customizable properties, including validation and event handling.
 *
 * Props:
 *
 * | **Property**               | **Example**                                          | **Type**                            | **Status**        |
 * |----------------------------|-----------------------------------------------------|-------------------------------------|-------------------|
 * | `ref`                       | `ref={textAreaRef}`                                  | `RefObject<HTMLTextAreaElement>`    | -                 |
 * | `id`                        | `id="textAreaId"`                                    | String                              | -                 |
 * | `className`                 | `className="custom-class"`                           | String                              | -                 |
 * | `value`                     | `value="Some text"`                                  | String                              | -                 |
 * | `label`                     | `label="Label text"`                                 | String                              | -                 |
 * | `error`                     | `error="This field is required"`                     | String                              | -                 |
 * | `success`                   | `success="Valid input"`                              | String                              | -                 |
 * | `disabled`                  | `disabled={true}`                                    | Boolean                             | -                 |
 * | `readOnly`                  | `readOnly={true}`                                    | Boolean                             | -                 |
 * | `placeholder`               | `placeholder="Enter text here"`                      | String                              | -                 |
 * | `autoComplete`              | `autoComplete="on"`                                  | String                              | -                 |
 * | `inputMode`                 | `inputMode="text"`                                   | String                              | -                 |
 * | `maxLength`                 | `maxLength={200}`                                    | Integer                             | -                 |
 * | `maxLengthIndicator`        | `maxLengthIndicator={true}`                          | Boolean                             | -                 |
 * | `tabIndex`                  | `tabIndex={0}`                                       | Integer                             | -                 |
 * | `maxLines`                  | `maxLines={5}`                                       | Integer                             | Default: 1        |
 * | `onChange`                  | `onChange={event => handleChange(event)}`            | Function                            | -                 |
 * | `onInput`                   | `onInput={event => handleInput(event)}`              | Function                            | -                 |
 * | `onKeyDown`                 | `onKeyDown={event => handleKeyDown(event)}`          | Function                            | -                 |
 * | `onBlur`                    | `onBlur={event => handleBlur(event)}`                | Function                            | -                 |
 * | `onPaste`                   | `onPaste={event => handlePaste(event)}`              | Function                            | -                 |
 * | `replaceNewlines`           | `replaceNewlines={true}`                              | Boolean                             | Default: false    |
 */
const TextArea: FC<OwnProps> = ({
  ref,
  id,
  className,
  value,
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
  maxLines = 1,
  onChange,
  onInput,
  onKeyDown,
  onBlur,
  onPaste,
  replaceNewlines = false,
}) => {
  const uuid = useMemo(() => id || generateUniqueId("textarea", "input"), [id]);

  const textareaRef = useRefInstead<HTMLTextAreaElement>(ref);
  const [isInputFocused, setFocused] = useState(false);

  const lang = navigator.language;
  const labelText = error || success || label;
  const fullClassName = buildClassName(
    s.TextArea,
    "input-group",
    isInputFocused && "touched",
    error ? "error" : success && "success",
    (disabled || readOnly) && "disabled",
    labelText && "with-label",
    className,
  );

  const resizeHeight = useStableCallback((element: HTMLTextAreaElement) => {
    requestMutation(() => {
      element.style.height = "0";

      requestForcedReflow(() => {
        const maxHeight = parseFloat(element.style.maxHeight) || 0;
        const newHeight = element.scrollHeight;

        return () => {
          element.style.height = `${newHeight}px`;
          element.style.overflow = maxHeight < newHeight ? "auto" : "hidden";
        };
      });
    });
  });

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.maxHeight = `${textarea.scrollHeight * maxLines}px`;

    resizeHeight(textarea);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxLines]);

  const handleChange = useStableCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      const target = e.currentTarget;
      const { value } = target;

      setFocused(value.trim().length > 0);

      if (replaceNewlines) {
        const previousSelectionEnd = target.selectionEnd;
        target.value = value.replace(/\n/g, " ");
        target.selectionEnd = previousSelectionEnd;
      }

      resizeHeight(target);
      onChange?.(e);
    },
  );

  return (
    <div className={fullClassName} dir={lang === "ar" ? "rtl" : undefined}>
      <textarea
        id={uuid}
        ref={textareaRef}
        aria-label={labelText}
        autoComplete={autoComplete}
        className="form-control awe-scrollbar"
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
      />
      {labelText && <label htmlFor={uuid}>{labelText}</label>}
      {maxLengthIndicator && (
        <div className="max-length-indicator">{maxLengthIndicator}</div>
      )}
      <div className={s.scrollbar}></div>
    </div>
  );
};

export default memo(TextArea);
