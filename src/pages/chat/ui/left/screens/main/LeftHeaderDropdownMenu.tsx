import React, { FC, useState } from "react";
import ContactsIcon from "@mui/icons-material/Contacts";
import SettingsIcon from "@mui/icons-material/Settings";
import AnimationIcon from "@mui/icons-material/Animation";
import DownloadIcon from "@mui/icons-material/Download";
import {
  ArrowForwardIosRounded,
  DarkModeRounded,
  FolderCopyRounded,
  GroupAddRounded,
  HelpRounded,
  LightModeRounded,
  ManageAccountsRounded,
  MenuRounded,
} from "@mui/icons-material";
import DropdownMenu, { TriggerProps } from "@/shared/ui/dropdown";
import ActionButton from "@/shared/ui/ActionButton";
import IconButton from "@/shared/ui/IconButton";
import { Avatar } from "@mui/material";
import buildClassName from "@/shared/lib/buildClassName";
import MenuSeparator from "@/shared/ui/MenuSeparator";
import SlideButton from "@/entities/SlideButton";
import { useLeftScreenNavigation } from "../../lib//ScreenContext";
import { useColorScheme } from "@mui/material/styles";
import { useStableCallback } from "@/shared/hooks/base";
import s from "./LeftHeaderDropdownMenu.module.scss";

const LeftHeaderDropdownMenu: FC = () => {
  const { mode, setMode } = useColorScheme();
  const { goTo } = useLeftScreenNavigation();

  const [animationLevel, setAnimationLevel] = useState<
    "none" | "basic" | "advanced"
  >("basic");

  const themeLabel = `${mode === "dark" ? "Светлая" : "Темная"} тема`;

  const TriggerButton: FC<TriggerProps> = ({ isOpen, onTrigger }) => (
    <IconButton active={isOpen} size="medium" onClick={onTrigger}>
      <MenuRounded />
    </IconButton>
  );

  const handleArchiveClick = useStableCallback(() => {
    goTo("Archived");
  });

  const handleSettingsClick = useStableCallback(() => {
    goTo("SettingsNavigation");
  });

  const handleContactsClick = useStableCallback(() => {
    goTo("Contacts");
  });

  const handleThemeClick = useStableCallback(() => {
    setMode(mode === "light" ? "dark" : "light");
  });

  const handleAnimationChange = useStableCallback(() => {
    setAnimationLevel((prev) =>
      prev === "none" ? "basic" : prev === "basic" ? "advanced" : "none",
    );
  });

  return (
    <DropdownMenu
      className={s.LeftDropdown}
      position="top-left"
      triggerButton={TriggerButton}
    >
      <div className={buildClassName(s.User)}>
        <Avatar
          className={s.Avatar}
          src="https://picsum.photos/200"
          alt="User avatar"
        />

        <div className="flex flex-col">
          <p className={buildClassName("awe-title", "awe-overflow-ellipsis")}>
            Andrii Volynets
          </p>
          <small
            className={buildClassName(
              s.badge,
              "awe-subtitle",
              "awe-overflow-ellipsis",
            )}
          >
            @volynetstyle
          </small>
        </div>

        <IconButton
          title={themeLabel}
          className={s.SettingsButton}
          size="medium"
          onClick={handleThemeClick}
        >
          {mode === "light" ? <DarkModeRounded /> : <LightModeRounded />}
        </IconButton>
      </div>

      <p className={buildClassName("awe-title", s.UserDescription)}>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit.
      </p>

      <div className={s.UserManageSection}>
        <ActionButton
          icon={<ManageAccountsRounded />}
          title="Manage accounts"
          disabled
        >
          My accounts (2)
        </ActionButton>

        <div className={s.Divider} />

        <IconButton
          className={s.SettingsButton}
          size="medium"
          title="Settings"
          onClick={handleSettingsClick}
        >
          <SettingsIcon className={s.SettingIcon} />
          <ArrowForwardIosRounded className={s.ArrowIcon} fontSize="small" />
        </IconButton>
      </div>
      <MenuSeparator size="thick" />

      <small className={s.ActionsTitle}>Collection</small>
      <ActionButton
        className="btn-menu-item"
        icon={<FolderCopyRounded />}
        label="Архив"
        title="Go to Archived"
        onClick={handleArchiveClick}
      />
      <ActionButton
        className="btn-menu-item"
        icon={<ContactsIcon />}
        label="Контакты"
        title="Go to Contacts"
        onClick={handleContactsClick}
      />
      <ActionButton
        className="btn-menu-item"
        icon={<GroupAddRounded />}
        label="Create group"
        title="Create a new group"
        disabled
      />

      <SlideButton
        classNames={{ child: "flex gap-2 items-center" }}
        onClick={handleAnimationChange}
      >
        <>
          <AnimationIcon />
          <span data-level="disabled">No Animations</span>
        </>
        <>
          <AnimationIcon />
          <span data-level="basic">Fast Animations</span>
        </>
        <>
          <AnimationIcon />
          <span data-level="advanced">Full Animations</span>
        </>
      </SlideButton>

      <MenuSeparator size="thick" />
      <ActionButton
        className="btn-menu-item"
        icon={<HelpRounded />}
        label="Помощь"
        title="Get help"
        disabled
      />
    </DropdownMenu>
  );
};

export default React.memo(LeftHeaderDropdownMenu);
