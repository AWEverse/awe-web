import React, { FC, ChangeEvent, FormEvent, memo } from 'react';
import s from './SearchInput.module.scss';
import buildClassName from '@/shared/lib/buildClassName';

interface OwnProps {
  searchQuery?: string;
  labelQuery?: string;
  searchDate?: number;
  isActive: boolean;
  placeholder?: string;
  ariaLabel?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  onReset?: () => void;
  startDecorator?: React.ReactNode;
  endDecorator?: React.ReactNode;
}

const SearchInput: FC<OwnProps> = memo(props => {
  const {
    placeholder = 'Type to search...',
    ariaLabel = 'Search',
    labelQuery = 'Search: ...',
    onChange,
    onSubmit,
    onReset,
    startDecorator,
    endDecorator,
    isActive,
  } = props;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit?.(event);
  };

  const handleReset = () => {
    onReset?.();
  };

  const inputClassName = buildClassName(s.input, isActive && s.active);

  return (
    <form className={s.wrapper} role="search" onReset={handleReset} onSubmit={handleSubmit}>
      <div className={s.decorator}>{startDecorator}</div>
      <input
        aria-label={ariaLabel}
        className={inputClassName}
        id="search"
        name="search"
        placeholder={placeholder}
        type="text"
        onChange={handleChange}
      />
      <label className={s.label} htmlFor="search">
        {labelQuery}
      </label>
      <span className={s.highlight}></span>
      <div className={s.decorator}>{endDecorator}</div>
    </form>
  );
});

export default SearchInput;
