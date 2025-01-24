import { FC } from "react";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ContactsIcon from "@mui/icons-material/Contacts";
import SettingsIcon from "@mui/icons-material/Settings";
import AnimationIcon from "@mui/icons-material/Animation";
import BugReportIcon from "@mui/icons-material/BugReport";
import AppsIcon from "@mui/icons-material/Apps";
import DownloadIcon from "@mui/icons-material/Download";
import DropdownMenu, { TriggerProps } from "@/shared/ui/DropdownMenu";
import {
  ArrowForwardIosRounded,
  DarkModeRounded,
  GroupAddRounded,
  HelpRounded,
  LightModeRounded,
  ManageAccountsRounded,
  MenuRounded,
} from "@mui/icons-material";
import ActionButton from "@/shared/ui/ActionButton";

import s from "./LeftHeaderDropdownMenu.module.scss";
import { useStableCallback } from "@/shared/hooks/base";
import useChatStore from "@/pages/chat/store/useChatSelector";
import { LeftColumnScreenType } from "@/pages/chat/types/LeftColumn";
import { useColorScheme } from "@mui/material/styles";
import IconButton from "@/shared/ui/IconButton";
import Modal from "@/shared/ui/Modal";
import { useBooleanState } from "@/shared/hooks/state";
import { Avatar } from "@mui/material";
import buildClassName from "@/shared/lib/buildClassName";
import MenuSeparator from "@/shared/ui/MenuSeparator";

interface OwnProps {}

interface StateProps {}

const LeftHeaderDropdownMenu: FC<OwnProps & StateProps> = () => {
  const { mode, setMode } = useColorScheme();
  const [downloadModal, setDownloadModal, resetDownloadModal] =
    useBooleanState(false);

  const themeLabel = `${mode === "dark" ? "Светлая" : "Темная"} тема`;

  const setScreen = useChatStore((store) => store.setScreen);

  const TriggerButton: FC<TriggerProps> = ({ isOpen, onTrigger }) => (
    <IconButton active={isOpen} size="medium" onClick={onTrigger}>
      <MenuRounded />
    </IconButton>
  );

  const handleSettingClick = useStableCallback(() => {
    setScreen(LeftColumnScreenType.Settings);
  });

  const handleContactsClick = useStableCallback(() => {
    setScreen(LeftColumnScreenType.Contacts);
  });

  const handleThemeClick = useStableCallback(() => {
    setMode(mode === "light" ? "dark" : "light");
  });

  return (
    <>
      <DropdownMenu
        className={s.LeftDropdown}
        position="top-left"
        shouldClose={downloadModal}
        triggerButton={TriggerButton}
      >
        <div className={buildClassName("awe-user", s.User)}>
          <Avatar className={s.Avatar} src="https://picsum.photos/200" />

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
            title="Manage accounts (2)"
          >
            My accounts (2)
          </ActionButton>

          <div className={s.Divider} />

          <IconButton
            className={s.SettingsButton}
            size="medium"
            onClick={handleSettingClick}
          >
            <SettingsIcon className={s.SettingIcon} />
            <ArrowForwardIosRounded className={s.ArrowIcon} fontSize="small" />
          </IconButton>
        </div>
        <MenuSeparator size="thick" />

        <small className={s.ActionsTitle}>Collection</small>
        <ActionButton
          className="btn-menu-item"
          icon={<FavoriteIcon />}
          label="Избранное"
        />
        <ActionButton
          className="btn-menu-item"
          icon={<ContactsIcon />}
          label="Контакты"
          onClick={handleContactsClick}
        />
        <ActionButton
          className="btn-menu-item"
          icon={<GroupAddRounded />}
          label="Create group"
        />
        <ActionButton
          className="btn-menu-item"
          icon={<AnimationIcon />}
          label="Анимация"
        />
        <ActionButton
          className="btn-menu-item"
          icon={<DownloadIcon />}
          label="Скачать"
          onClick={setDownloadModal}
        />
        <ActionButton
          className="btn-menu-item"
          icon={<AppsIcon />}
          label="Приложения"
        />
        <MenuSeparator size="thick" />
        <ActionButton
          className="btn-menu-item"
          icon={<BugReportIcon />}
          label="Ошибки"
        />
        <ActionButton
          className="btn-menu-item"
          icon={<HelpRounded />}
          label="Помощь"
        />
      </DropdownMenu>

      <Modal isOpen={downloadModal} onClose={resetDownloadModal}>
        lablflasf
      </Modal>
    </>
  );
};

export default LeftHeaderDropdownMenu;
