import React, { memo, useCallback } from 'react';
import FlatList from '@/entities/FlatList';
import TagCheckbox from '@/entities/TagCheckbox';

interface ThreadTagsProps {
  items: string[];
  selected?: string[];
  onChange?: (selected: string[]) => void;
}

const ThreadTags: React.FC<ThreadTagsProps> = ({ items, selected = [], onChange }) => {
  const handleCheckboxChange = useCallback(
    (name: string) => {
      const newSelected = selected.includes(name) ? selected.filter(item => item !== name) : [...selected, name];

      onChange?.(newSelected);
    },
    [onChange, selected],
  );

  const renderCheckbox = useCallback(
    (item: string) => {
      return <TagCheckbox checked={selected.includes(item)} handleCheckboxChange={handleCheckboxChange} name={item} />;
    },
    [selected, handleCheckboxChange],
  );

  return (
    <FlatList
      horizontal
      ListHeaderComponent={<h1 className="text-2xl font-bold mb-2">Pin on the main thread</h1>}
      data={items}
      keyExtractor={item => item}
      renderItem={renderCheckbox}
    />
  );
};

export default memo(ThreadTags);
