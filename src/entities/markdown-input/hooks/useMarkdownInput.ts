import { useState, useRef, useCallback, useEffect } from "react";

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

  const sanitize = useCallback(
    (raw: string) => {
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

  useEffect(() => {
    const sanitized = sanitize(value);
    setText(sanitized);
    lastValue.current = sanitized;
  }, [value, sanitize]);

  const handleTextChange = useCallback(
    (newText: string) => {
      const sanitized = sanitize(newText);
      if (maxLength && sanitized.length > maxLength) {
        const truncated = sanitized.slice(0, maxLength);
        setText(truncated);
        onChange?.(truncated);
        lastValue.current = truncated;
        return;
      }
      setText(sanitized);
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
      }
    }
  }, [text, validateInput, onSubmit, clearOnSubmit]);

  return { text, error, handleTextChange, handleSubmit };
}
