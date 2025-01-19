import React, { memo, useCallback, useReducer, useMemo, useState } from "react";
import FlatList from "@/entities/FlatList";
import TagCheckbox from "@/entities/TagCheckbox";
import useLastCallback from "@/lib/hooks/callbacks/useLastCallback";
import { debounce } from "@/lib/core";

interface ThreadTagsProps {
  items: string[];
  selected?: string[];
  onChange?: (selected: string[]) => void;
}

type Action = { type: "toggle"; payload: string };
function selectionReducer(state: string[], action: Action) {
  switch (action.type) {
    case "toggle": {
      const stateSet = new Set(state);

      if (stateSet.has(action.payload)) {
        stateSet.delete(action.payload);
      } else {
        stateSet.add(action.payload);
      }

      return Array.from(stateSet);
    }
    default:
      return state;
  }
}

const ThreadTags: React.FC<ThreadTagsProps> = ({
  items,
  selected = [],
  onChange = () => {},
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [state, dispatch] = useReducer(selectionReducer, selected);

  const debouncedOnChange = useMemo(() => debounce(onChange, 300), [onChange]);

  const handleCheckboxChange = useCallback(
    (name: string) => {
      dispatch({ type: "toggle", payload: name });
      debouncedOnChange(state);
    },
    [debouncedOnChange, state],
  );

  const filteredItems = useMemo(
    () =>
      items.filter((item) =>
        item.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [items, searchQuery],
  );

  const renderCheckbox = useCallback(
    (item: string) => (
      <TagCheckbox
        checked={state.includes(item)}
        handleCheckboxChange={handleCheckboxChange}
        name={item}
      />
    ),
    [state, handleCheckboxChange],
  );

  const handleSearch = useLastCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
  );

  return (
    <div>
      <input
        type="text"
        placeholder="Search tags..."
        value={searchQuery}
        onChange={handleSearch}
        className="mb-4 p-2 border rounded"
      />
      <FlatList
        horizontal
        ListHeaderComponent={
          <h1 className="text-2xl font-bold mb-2">Pin on the main thread</h1>
        }
        data={filteredItems}
        keyExtractor={(item) => item}
        renderItem={renderCheckbox}
      />
    </div>
  );
};

export default memo(ThreadTags);
