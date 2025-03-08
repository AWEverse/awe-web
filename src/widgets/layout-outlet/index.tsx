import { Outlet } from "react-router";
import "./index.scss";
import { ScrollProvider } from "@/shared/context";
import { FC, useRef, useState } from "react";
import SearchInput from "@/shared/ui/SearchInput";
import Dropdown, { TriggerProps } from "@/shared/ui/dropdown";
import IconButton from "@/shared/ui/IconButton";
import {
  MenuRounded,
  MicRounded,
  NotificationsRounded,
} from "@mui/icons-material";
import NotificationDropdown from "./ui/NotificationDropdown";
import PersonalDropdown from "./ui/PersonalDroprown";
import { AnimatePresence, motion } from "framer-motion";
import useAppLayout from "@/lib/hooks/ui/useAppLayout";
import { useStableCallback } from "@/shared/hooks/base";

const LayoutOutlet = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { isMobile } = useAppLayout();
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = useStableCallback(() => {
    if (isMobile) {
      setIsFocused(true);
    }
  });

  const handleBlur = useStableCallback(() => {
    if (isMobile) {
      setIsFocused(false);
    }
  });

  return (
    <ScrollProvider containerRef={containerRef}>
      <div className="LayoutOutlet">
        <header className="LayoutHeader" role="banner">
          {!isFocused && (
            <IconButton aria-label="Open navigation menu">
              <MenuRounded />
            </IconButton>
          )}

          <SearchInput
            parentContainerClassName="LayoutHeader__Search"
            onFocus={handleFocus}
            onBlur={handleBlur}
            aria-label="Search the app"
          />

          {!isFocused && (
            <>
              <IconButton aria-label="Voice search">
                <MicRounded />
              </IconButton>

              <NotificationDropdown />
              <PersonalDropdown />
            </>
          )}
        </header>

        <main data-scrolled={true} className="LayoutBody" role="main">
          <Outlet />
        </main>
      </div>
    </ScrollProvider>
  );
};

export default LayoutOutlet;
