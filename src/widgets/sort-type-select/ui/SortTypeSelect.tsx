import React, { memo, useCallback, useMemo } from 'react';
import { Box, Chip, Select } from '@mui/material';
import { SortTypeProvider, useSortTypeContext } from './SortTypeProvider';

type onChangeEvent =
  | React.MouseEvent<Element, MouseEvent>
  | React.KeyboardEvent<Element>
  | React.FocusEvent<Element, Element>
  | null;

interface OptionProps {
  [key: string]: string;
}

interface OwnProps {
  options: OptionProps;
  defaultValues?: string[];
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  onChange?: (event: onChangeEvent, value: string[]) => void;
}

type SortTypeSelectProps = OwnProps;

type SelectOption<T> = {
  value: T;
  label: string;
};

type Option = {
  value: string;
  label: string;
  icon: JSX.Element;
};

const renderValues = (options: OptionProps) => (selected: SelectOption<string>[]) => (
  <Box
    sx={{
      overflow: 'auto',
      display: 'flex',
      gap: '0.25rem',
    }}
  >
    {selected.map((selectedOption, index) => (
      <Chip key={index} size="sm">
        {options[selectedOption.value]}
      </Chip>
    ))}
  </Box>
);

const SortTypeSelectComponent: React.FC<SortTypeSelectProps> = memo(({ options, onChange, onClick }) => {
  const { selectedValues, setSelectedValues } = useSortTypeContext();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    onClick && onClick(event);
  };

  const handleChange = useCallback(
    (event: onChangeEvent, value: string[]) => {
      setSelectedValues(value);
      onChange && onChange(event, value);
    },
    [onChange, setSelectedValues],
  );

  const renderValuesMemoized = useMemo(() => renderValues(options), [options]);

  const optionEntries = useMemo(
    () =>
      Object.entries(options).map(([value, label]) => (
        <Option key={value} value={value}>
          {label}
        </Option>
      )),
    [options],
  );

  return (
    <Select
      multiple
      placeholder="Sort by type"
      renderValue={renderValuesMemoized}
      slotProps={{
        listbox: {
          sx: {
            maxWidth: '100%',
          },
        },
      }}
      sx={{ minWidth: '250px' }}
      value={selectedValues}
      onChange={handleChange}
      onClick={handleClick}
    >
      {optionEntries}
    </Select>
  );
});

const SortTypeSelect: React.FC<SortTypeSelectProps> = props => {
  return (
    <SortTypeProvider>
      <SortTypeSelectComponent {...props} />
    </SortTypeProvider>
  );
};

export default memo(SortTypeSelect);
