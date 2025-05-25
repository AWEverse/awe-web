import { useState, useRef, useCallback, useEffect, useMemo } from "react";

export default function useMarkdownInput({
  value = "",
  sanitizeFn,
  validate,
  maxLength,
  clearOnSubmit,
  onChange,
  onSubmit,
}: Partial<{
  value: string;
  sanitizeFn: (v: string) => string;
  validate: (v: string) => boolean | string;
  maxLength: number;
  clearOnSubmit: boolean;
  submitOnCtrlEnter: boolean;
  submitKey: string;
  onChange: (v: string) => void;
  onSubmit: (v: string) => void | ((v: string) => void);
}>) {
  const [text, setText] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const lastValue = useRef(value);

  // Memoize sanitize function to prevent unnecessary re-renders
  const sanitize = useMemo(
    () => (raw: string) => {
      const norm = raw.replace(/\r\n/g, "\n");
      return sanitizeFn ? sanitizeFn(norm) : norm;
    },
    [sanitizeFn],
  );

  const validateInput = useCallback(
    (v: string) => {
      if (!validate) return true;
      const result = validate(v);
      if (typeof result === "string") {
        setError(result);
        return false;
      }
      if (!result) {
        setError("Invalid input");
        return false;
      }
      setError(null);
      return true;
    },
    [validate],
  );

  // Only update when external value changes
  useEffect(() => {
    if (value !== lastValue.current) {
      const sanitized = sanitize(value);
      setText(sanitized);
      lastValue.current = value; // Store original value, not sanitized
    }
  }, [value, sanitize]);

  const handleTextChange = useCallback(
    (newText: string) => {
      const sanitized = sanitize(newText);

      // Handle max length constraint
      if (maxLength && sanitized.length > maxLength) {
        const truncated = sanitized.slice(0, maxLength);
        setText(truncated);
        onChange?.(truncated);
        lastValue.current = truncated;
        setError(`Maximum ${maxLength} characters allowed`);
        return;
      }

      setText(sanitized);

      // Only call onChange if value actually changed
      if (sanitized !== lastValue.current) {
        onChange?.(sanitized);
        lastValue.current = sanitized;
      }

      validateInput(sanitized);
    },
    [sanitize, maxLength, onChange, validateInput],
  );

  const handleSubmit = useCallback(() => {
    if (validateInput(text)) {
      onSubmit?.(text);
      if (clearOnSubmit) {
        setText("");
        lastValue.current = "";
        setError(null);
      }
    }
  }, [text, validateInput, onSubmit, clearOnSubmit]);

  return { text, error, handleTextChange, handleSubmit };
}
