import {
  ChangeEvent,
  FC,
  InputHTMLAttributes,
  memo,
  RefObject,
  useMemo,
  useState,
} from "react";
import buildClassName from "../lib/buildClassName";
import { useRefInstead } from "@/shared/hooks/base";
import { useStableCallback } from "@/shared/hooks/base";
import useUniqueId, {
  generateUniqueId,
} from "@/lib/hooks/utilities/useUniqueId";

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
  ...props
}) => {
  const uuid = useUniqueId("text-input", id);

  const inputRef = useRefInstead<HTMLInputElement>(ref);
  const [isInputFocused, setFocused] = useState(focused);

  const handleChange = useStableCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget;

    if (/^\s/.test(value)) {
      e.currentTarget.value = "";
      return;
    }

    setFocused(value.trim().length > 0);

    onChange?.(e);
  });

  const fullClassName = buildClassName(
    "input-group",
    isInputFocused && "touched",
    error ? "error" : success && "success",
    className,
  );

  const renderLabel = () =>
    label ? (
      <label htmlFor={uuid}>
        {label}&nbsp;{required && "(required)"}
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
        onChange={handleChange}
        {...props}
      />
      {renderLabel()}
      {renderHelper()}
    </div>
  );
};

export default memo(TextInput);
