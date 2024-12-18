import {
  RefObject,
  ChangeEvent,
  FormEvent,
  FC,
  useLayoutEffect,
  memo,
  useState,
  useMemo,
} from 'react';
import buildClassName from '../lib/buildClassName';
import useRefInstead from '@/lib/hooks/state/useRefInstead';
import { requestMutation, requestForcedReflow } from '@/lib/modules/fastdom/fastdom';
import useLastCallback from '@/lib/hooks/events/useLastCallback';
import { generateUniqueId } from '@/lib/hooks/utilities/useUniqueId';

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
  inputMode?: 'text' | 'none' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onInput?: (e: FormEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onPaste?: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
};

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
  onChange,
  onInput,
  onKeyDown,
  onBlur,
  onPaste,
  replaceNewlines = false,
}) => {
  const uuid = useMemo(() => id || generateUniqueId('textarea', 'input'), [id]);

  const textareaRef = useRefInstead<HTMLTextAreaElement>(ref);
  const [isInputFocused, setFocused] = useState(false);

  const lang = navigator.language;
  const labelText = error || success || label;
  const fullClassName = buildClassName(
    'input-group',
    isInputFocused && 'touched',
    error ? 'error' : success && 'success',
    disabled && 'disabled',
    readOnly && 'disabled',
    labelText && 'with-label',
    className,
  );

  const resizeHeight = useLastCallback((element: HTMLTextAreaElement) => {
    requestMutation(() => {
      element.style.height = '0';

      requestForcedReflow(() => {
        const newHeight = element.scrollHeight;

        return () => {
          element.style.height = `${newHeight}px`;
        };
      });
    });
  });

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    resizeHeight(textarea);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    const { value } = target;

    // Если значение начинается с пробела, очищаем поле
    if (/^\s/.test(value)) {
      target.value = '';
      return;
    }

    const trimmedValue = value.trim();
    setFocused(trimmedValue.length > 0);

    if (replaceNewlines) {
      const previousSelectionEnd = target.selectionEnd;
      // Заменяем переносы строк на пробелы
      target.value = value.replace(/\n/g, ' ');
      target.selectionEnd = previousSelectionEnd;
    }

    resizeHeight(target);
    onChange?.(e);
  };

  return (
    <div className={fullClassName} dir={lang === 'ar' ? 'rtl' : undefined}>
      <textarea
        ref={textareaRef}
        aria-label={labelText}
        autoComplete={autoComplete}
        className="form-control"
        dir="auto"
        disabled={disabled}
        id={uuid}
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
      {maxLengthIndicator && <div className="max-length-indicator">{maxLengthIndicator}</div>}
    </div>
  );
};

export default memo(TextArea);
