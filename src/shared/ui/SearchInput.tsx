import React, {
  FC,
  ReactNode,
  RefObject,
  useCallback,
  memo,
  useMemo,
  useEffect,
} from "react";
import s from "./SearchInput.module.scss";
import CircularProgress from "@mui/material/CircularProgress";
import { CloseRounded, SearchRounded } from "@mui/icons-material";
import { useRefInstead, useStableCallback } from "@/shared/hooks/base";
import buildClassName from "../lib/buildClassName";
import { requestMeasure } from "@/lib/modules/fastdom";
import { useBooleanState } from "../hooks/state";
import { EKeyboardKey } from "@/lib/core";
import I18n from "./i18n";
import { useTranslation } from "react-i18next";

type InputProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

interface OwnProps {
  parentContainerClassName?: string;
  resultsItemSelector?: string;
  inputId?: string;
  focused?: boolean;
  isLoading?: boolean;
  canClose?: boolean;
  labels?: ReactNode[];
  size?: "small" | "medium" | "large";
  startDecorator?: ReactNode;
  endDecorator?: ReactNode;
  indicator?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onReset?: NoneToVoidFunction;
  onFocus?: NoneToVoidFunction;
  onBlur?: NoneToVoidFunction;
  onStartBackspace?: NoneToVoidFunction;
  onSpinnerClick?: NoneToVoidFunction;
}

const SearchInput: FC<OwnProps & InputProps> = ({
  ref,
  parentContainerClassName,
  className,
  inputId = "search-input",
  value,
  focused,
  isLoading = false,
  placeholder,
  labels,
  disabled,
  autoComplete,
  canClose,
  size = "medium",
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
  const [isInputFocused, markInputFocused, unmarkInputFocused] =
    useBooleanState(focused);

  useEffect(() => {
    if (!inputRef.current) return;
    if (focused) {
      requestMeasure(() => {
        inputRef.current!.focus();
      });
    } else {
      inputRef.current.blur();
    }
  }, [focused]);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(event);
    },
    [onChange],
  );

  const handleFocus = useCallback(() => {
    markInputFocused();
    onFocus?.();
  }, [markInputFocused, onFocus]);

  const handleBlur = useCallback(() => {
    unmarkInputFocused();
    onBlur?.();
  }, [unmarkInputFocused, onBlur]);

  const handleReset = useCallback(() => {
    onReset?.();
  }, [onReset]);

  const handleKeyDown = useStableCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!resultsItemSelector) return;
      if (e.code === EKeyboardKey.ArrowDown || e.code === EKeyboardKey.Enter) {
        const element = document.querySelector(
          resultsItemSelector,
        ) as HTMLElement;
        requestMeasure(() => {
          element?.focus();
        });
      }
      const isBackspace =
        e.code === EKeyboardKey.Backspace &&
        e.currentTarget.selectionStart === 0 &&
        e.currentTarget.selectionEnd === 0;

      if (isBackspace) {
        onStartBackspace?.();
      }
    },
  );

  const renderLabels = useMemo(() => {
    if (!labels) return null;
    return (
      <>
        <label className={s.labelsContainer} htmlFor={inputId}>
          {labels.map((label) => (
            <span key={label?.toString()} className={s.labelText}>
              {label}
            </span>
          ))}
        </label>
        <span className={s.separator}></span>
      </>
    );
  }, [inputId, labels]);

  const renderLoading = () =>
    isLoading && (
      <CircularProgress className={s.spinner} onClick={onSpinnerClick} />
    );

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

  const { t: translation } = useTranslation();

  const SearchPlaceholder = translation("search.placeholder");

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
      aria-busy={isLoading}
      onSubmit={(e) => e.preventDefault()}
    >
      <label className={s.visuallyHidden} htmlFor={inputId}>
        {SearchPlaceholder}
      </label>
      {startDecorator}
      <div className={s.searchIcon}>
        <SearchRounded />
        <i className={s.dot}></i>
      </div>
      {labels && renderLabels}
      <input
        ref={inputRef}
        aria-label={SearchPlaceholder}
        autoComplete={autoComplete}
        className={buildClassName(s.input, className, !labels && s.noLabels)}
        type="text"
        dir="auto"
        tabIndex={tabIndex}
        disabled={disabled}
        id={inputId}
        placeholder={placeholder || SearchPlaceholder}
        value={value}
        onBlur={handleBlur}
        onChange={handleChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
      />
      <div
        className={buildClassName(s.bottomIndicator, !!indicator && s.visible)}
      >
        <span>{indicator}</span>
      </div>
      {endDecorator}
      {renderLoading()}
      {renderCloseButton()}
    </form>
  );
};

export default memo(SearchInput);
