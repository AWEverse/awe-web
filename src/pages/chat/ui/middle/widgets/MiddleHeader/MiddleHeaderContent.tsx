import { CalendarMonthRounded, CloseRounded } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { AnimatePresence, motion } from "motion/react";
import { useCallback } from "react";
import PinnedMessageButton from "../../common/PinnedMessageButton";
import MiddleHeaderActions from "./MiddleHeaderActions";
import MiddleHeaderSearch from "./MiddleHeaderSearch";
import useChatStore from "@/pages/chat/store/useChatSelector";
import useAppLayout from "@/lib/hooks/ui/useAppLayout";

const TRANSITION_DURATION = 0.125;

const variants = {
  search: {
    initial: { y: -20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
  },
  main: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 20, opacity: 0 },
  },
};

interface HeaderContentProps {
  senderName: string;
  isSearchOpen: boolean;
  onDateModalOpen: () => void;
}

export const HeaderContent: React.FC<HeaderContentProps> = ({
  senderName,
  isSearchOpen,
  onDateModalOpen,
}) => {
  const toggleMiddleSearch = useChatStore((s) => s.toggleChatSearching);
  const openProfileColumn = useChatStore((s) => s.openProfileColumn);
  const lessTablet = useAppLayout((state) => state.isTablet || state.isMobile);

  const renderSearch = useCallback(
    () => (
      <>
        <MiddleHeaderSearch />
        <IconButton onClick={onDateModalOpen}>
          <CalendarMonthRounded />
        </IconButton>
        <IconButton onClick={toggleMiddleSearch}>
          <CloseRounded />
        </IconButton>
      </>
    ),
    [onDateModalOpen, toggleMiddleSearch],
  );

  const renderMain = useCallback(
    () => (
      <>
        <div
          className="UserDetails allow-width-right-column-header"
          onClick={openProfileColumn}
        >
          <p>{senderName}</p>
        </div>
        <div className="MiddleHeaderActions allow-space-right-column-header">
          {!lessTablet && (
            <PinnedMessageButton
              activeIndex={0}
              className="InAction"
              segmentCount={10}
            />
          )}
          <MiddleHeaderActions />
        </div>
      </>
    ),
    [lessTablet, openProfileColumn, senderName],
  );

  return (
    <div className="HeaderBodyWrapper">
      <AnimatePresence initial={false}>
        <motion.div
          key={isSearchOpen ? "search" : "main"}
          initial={
            isSearchOpen ? variants.search.initial : variants.main.initial
          }
          animate={
            isSearchOpen ? variants.search.animate : variants.main.animate
          }
          exit={isSearchOpen ? variants.search.exit : variants.main.exit}
          transition={{ duration: TRANSITION_DURATION }}
          className="HeaderTransition"
        >
          {isSearchOpen ? renderSearch() : renderMain()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
