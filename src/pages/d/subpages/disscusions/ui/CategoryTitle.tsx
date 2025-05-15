import { WithDecorators } from "@/types/props";
import buildClassName from "@/shared/lib/buildClassName";
import s from "./CategoryTitle.module.scss";
import { FC, useState } from "react";
import formatLargeNumber from "@/lib/utils/helpers/number/formatLargeNumber";
import IconExpand from "@/shared/ui/IconExpand";
import { SearchRounded, CloseRounded } from "@mui/icons-material";
import { AnimatePresence, motion } from "framer-motion";
import SearchInput from "@/shared/ui/SearchInput";
import { useDebouncedFunction } from "@/shared/hooks/shedulers";
import { SLIDE_BOTTOM, SLIDE_TOP } from "@/shared/animations/slideInVariant";
import IconButton from "@/shared/ui/IconButton";

interface OwnProps {
  name: string;
  desc: string;
  posts?: number | string;
  className?: string;
  onSearch?: (query: string) => void;
}

const CategoryTitle: FC<OwnProps & WithDecorators> = (props) => {
  const { name, desc, posts, className, onSearch } = props;
  const [activeSlide, setActiveSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const classNames = buildClassName(s.CategoryTitleWrapper, className, {
    [s.searchActive]: activeSlide === 1,
  });

  const handleSearch = useDebouncedFunction(() => {
    onSearch?.(searchQuery);
    setSearchQuery("");
    setActiveSlide(0);
  }, 250);

  return (
    <div className={classNames}>
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={activeSlide}
          className={s.CategoryTitle}
          variants={activeSlide ? SLIDE_BOTTOM : SLIDE_TOP}
          initial={"hidden"}
          animate={"visible"}
          exit={"exit"}
        >
          {activeSlide === 0 ? (
            <>
              <div className={s.title}>
                <h1>
                  {name}
                  <span className={s.postCount}>
                    ({formatLargeNumber(Number(posts))})
                  </span>
                </h1>
                <p>{desc}</p>
              </div>
              <IconButton className={s.controls}>
                <SearchRounded
                  fontSize="small"
                  onClick={() => setActiveSlide(1)}
                />
              </IconButton>
            </>
          ) : (
            <>
              <SearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search in category..."
                autoFocus
              />
              <CloseRounded
                className={s.closeIcon}
                onClick={() => setActiveSlide(0)}
              />
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default CategoryTitle;
