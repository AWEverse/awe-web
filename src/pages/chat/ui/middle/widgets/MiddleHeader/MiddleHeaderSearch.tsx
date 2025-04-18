import { useStableCallback } from "@/shared/hooks/base";
import { debounce } from "@/lib/core";
import SearchInput from "@/shared/ui/SearchInput";
import { FC, memo, useEffect, useState } from "react";

import s from "./MiddleHeaderSearch.module.scss";
import SearchResults from "../../search/SearchResults";
import { useDebouncedFunction } from "@/shared/hooks/shedulers";
import buildClassName from "@/shared/lib/buildClassName";

interface OwnProps {}

interface StateProps {}

const MiddleHeaderSearch: FC<OwnProps & StateProps> = () => {
  const [value, _setValue] = useState("");
  const [isFocus, setIsFocus] = useState(false);

  const hasValue = Boolean(value);

  const setValue = useDebouncedFunction(_setValue, 250, true, false);

  const handleChange = useStableCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
    },
  );

  const handleFocus = useStableCallback(
    debounce(() => {
      setIsFocus(true);
    }, 250),
  );

  const handleBlur = useStableCallback(
    debounce(() => {
      setIsFocus(false);
    }, 250),
  );

  const handleReset = useStableCallback(() => {
    setValue("");
  });

  return (
    <section className={buildClassName(s.MiddleHeaderSearch)}>
      <SearchInput
        role="combobox"
        aria-controls="search-results"
        aria-expanded={isFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        onFocus={handleFocus}
        onReset={handleReset}
        indicator={hasValue ? "Found: 15 in 0.53s" : undefined}
      />

      <SearchResults
        isVisible={hasValue}
        onEsc={handleReset}
        onTab={handleReset}
      />
    </section>
  );
};

export default memo(MiddleHeaderSearch);
