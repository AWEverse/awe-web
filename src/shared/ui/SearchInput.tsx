import { FC, ReactNode, RefObject, useCallback, memo, useMemo, useEffect } from 'react';

import s from './SearchInput.module.scss';
import useFlag from '@/lib/hooks/state/useFlag';
import CircularProgress from '@mui/material/CircularProgress';
import { CloseRounded, SearchRounded } from '@mui/icons-material';
import useRefInstead from '@/lib/hooks/state/useRefInstead';
import { useIntl } from 'react-intl';
import useLastCallback from '@/lib/hooks/events/useLastCallback';
import buildClassName from '../lib/buildClassName';
import { requestMeasure } from '@/lib/modules/fastdom/fastdom';

interface OwnProps {
  ref?: RefObject<HTMLInputElement>;
  children?: React.ReactNode;
  parentContainerClassName?: string;
  resultsItemSelector?: string;
  className?: string;
  inputId?: string;
  value?: string;
  focused?: boolean;
  isLoading?: boolean;
  placeholder?: string;
  disabled?: boolean;
  autoComplete?: string;
  canClose?: boolean;
  labels?: ReactNode[];
  labelsVariant?: 'text' | 'literal' | 'dot';
  size?: 'small' | 'medium' | 'large';
  startDecorator?: ReactNode;
  endDecorator?: ReactNode;
  indicator?: string | number;
  tabIndex?: number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onReset?: NoneToVoidFunction;
  onFocus?: NoneToVoidFunction;
  onBlur?: NoneToVoidFunction;
  onStartBackspace?: NoneToVoidFunction;
  onSpinnerClick?: NoneToVoidFunction;
}

const SearchInput: FC<OwnProps> = ({
  ref,
  parentContainerClassName,
  className,
  inputId = 'search-input',
  value,
  focused,
  isLoading = false,
  placeholder,
  labels,
  disabled,
  autoComplete,
  canClose,
  size = 'medium',
  startDecorator,
  endDecorator,
  indicator,
  resultsItemSelector,
  tabIndex = 0,
  onChange,
  onReset,
  onFocus,
  onBlur,
  onStartBackspace,
  onSpinnerClick,
}) => {
  const inputRef = useRefInstead<HTMLInputElement>(ref);
  const [isInputFocused, markInputFocused, unmarkInputFocused] = useFlag(focused);

  const { formatMessage } = useIntl();

  useEffect(() => {
    if (!inputRef.current) {
      return;
    }

    if (focused) {
      inputRef.current.focus();
    } else {
      inputRef.current.blur();
    }
  }, [focused, placeholder]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(event);

    if (!isInputFocused) {
      handleFocus();
    }
  };

  const handleFocus = () => {
    markInputFocused();
    onFocus?.();
  };

  const handleBlur = () => {
    unmarkInputFocused();
    onBlur?.();
  };

  const handleReset = useCallback(() => {
    onReset?.();
  }, [onReset]);

  const handleKeyDown = useLastCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!resultsItemSelector) {
      return;
    }

    if (e.key === 'ArrowDown' || e.key === 'Enter') {
      requestMeasure(() => {
        const element = document.querySelector(resultsItemSelector) as HTMLElement;

        if (element) {
          element.focus();
        }
      });
    }

    const isBackspace =
      e.key === 'Backspace' &&
      e.currentTarget.selectionStart === 0 &&
      e.currentTarget.selectionEnd === 0;

    if (isBackspace) {
      onStartBackspace?.();
    }
  });

  const placeholderIntl = formatMessage({ id: 'search.placeholder' });

  const renderLabels = useMemo(() => {
    if (!labels) return null;

    return (
      <>
        <label className={s.labelsContainer} htmlFor={inputId}>
          {labels.map(label => (
            <span key={label?.toString()} className={s.labelText}>
              {label}
            </span>
          ))}
        </label>
        <span className={s.separator}></span>
      </>
    );
  }, [inputId, labels]);

  const renderLoading = () => {
    return isLoading && <CircularProgress className={s.spinner} onClick={onSpinnerClick} />;
  };

  const renderCloseButton = () => {
    const canRender = !isLoading && (value || canClose) && onReset;

    return (
      canRender && (
        <button
          aria-label="Clear search"
          className={s.clearButton}
          type="button"
          onClick={handleReset}
        >
          <CloseRounded className={s.clearIcon} />
        </button>
      )
    );
  };

  return (
    <form
      autoComplete="off"
      className={buildClassName(
        s.searchInputRoot,
        parentContainerClassName,
        s[size],
        isInputFocused && s.focused,
      )}
      data-loading={isLoading}
      role="search"
      onSubmit={e => e.preventDefault()}
    >
      <label className={s.visuallyHidden} htmlFor={inputId}>
        {placeholderIntl}
      </label>

      {startDecorator}

      <div className={s.searchIcon}>
        <SearchRounded />
        <i className={s.dot}></i>
      </div>

      {labels && renderLabels}
      <input
        ref={inputRef}
        aria-label={placeholderIntl}
        autoComplete={autoComplete}
        className={buildClassName(s.input, className, !labels && s.noLabels)}
        type="text"
        dir="auto"
        tabIndex={tabIndex}
        disabled={disabled}
        id={inputId}
        placeholder={placeholder || placeholderIntl}
        value={value}
        onBlur={handleBlur}
        onChange={handleChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
      />
      <div className={buildClassName(s.bottomIndicator, !!indicator && s.visible)}>
        <span>{indicator}</span>
      </div>
      {endDecorator}
      {renderLoading()}
      {renderCloseButton()}
    </form>
  );
};

export default memo(SearchInput);
