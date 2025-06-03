import {
  ChangeEvent,
  FC,
  InputHTMLAttributes,
  memo,
  RefObject,
  useState,
  useRef,
} from "react";
import buildClassName from "../lib/buildClassName";
import { useRefInstead } from "@/shared/hooks/base";
import { useStableCallback } from "@/shared/hooks/base";
import useUniqueId from "@/lib/hooks/utilities/useUniqueId";

interface OwnProps extends InputHTMLAttributes<HTMLInputElement> {
  ref?: RefObject<HTMLInputElement>;
  id?: string;
  className?: string;
  label?: string;
  required?: boolean;
  error?: string;
  success?: string;
  helperText?: string;
  focused?: boolean;
  rounded?: "sm" | "md" | "lg" | "xl";
  variant?: "slide" | "move" | "zoom";
  maxGraphemeLength?: number;
}

const TextInput: FC<OwnProps> = ({
  id,
  ref,
  className,
  label = "Please enter a value",
  required,
  error,
  success,
  helperText,
  focused,
  onChange,
  maxGraphemeLength,
  ...props
}) => {
  const uuid = useUniqueId("text-input", id);
  const inputRef = useRefInstead<HTMLInputElement>(ref);
  const [isInputFocused, setFocused] = useState(focused);

  const previousValueRef = useRef<string>("");
  const previousSelectionRef = useRef<{ start: number; end: number }>({
    start: 0,
    end: 0,
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    previousValueRef.current = e.currentTarget.value;
    previousSelectionRef.current = {
      start: e.currentTarget.selectionStart ?? 0,
      end: e.currentTarget.selectionEnd ?? 0,
    };
  };

  const handleChange = useStableCallback((e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.currentTarget.value;

    if (maxGraphemeLength && countGraphemes(newValue) > maxGraphemeLength) {
      e.currentTarget.value = previousValueRef.current;
      e.currentTarget.setSelectionRange(
        previousSelectionRef.current.start,
        previousSelectionRef.current.end,
      );
      return;
    }

    if (/^\s/.test(newValue)) {
      e.currentTarget.value = "";
      return;
    }

    setFocused(newValue.trim().length > 0);
    onChange?.(e);
  });

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (!maxGraphemeLength) return;

    const pasteData = e.clipboardData.getData("text");
    const currentValue = e.currentTarget.value;
    const selectionStart = e.currentTarget.selectionStart ?? 0;
    const selectionEnd = e.currentTarget.selectionEnd ?? 0;

    const newValue =
      currentValue.slice(0, selectionStart) +
      pasteData +
      currentValue.slice(selectionEnd);

    if (countGraphemes(newValue) > maxGraphemeLength) {
      e.preventDefault();
    }
  };

  const fullClassName = buildClassName(
    "input-group",
    isInputFocused && "touched",
    error ? "error" : success && "success",
    className,
  );

  const renderLabel = () =>
    label ? (
      <label htmlFor={uuid}>
        {label} {required && "(required)"}
      </label>
    ) : null;

  const renderHelper = () =>
    !error && helperText ? (
      <span className={"max-length-indicator"} id={`${uuid}-helper`}>
        {helperText}
      </span>
    ) : null;

  return (
    <div className={fullClassName}>
      <input
        ref={inputRef}
        aria-describedby={
          error ? `${uuid}-error` : helperText ? `${uuid}-helper` : undefined
        }
        aria-invalid={!!error}
        className={"form-control"}
        id={uuid}
        required={required}
        onKeyDown={handleKeyDown}
        onChange={handleChange}
        onPaste={handlePaste}
        {...props}
      />
      {renderLabel()}
      {renderHelper()}
    </div>
  );
};

const countGraphemes = (str: string): number => {
  const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
  return Array.from(segmenter.segment(str)).length;
};

export default memo(TextInput);
