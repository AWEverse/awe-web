import ActionButton from "@/shared/ui/ActionButton";
import {
  EditRounded,
  ExitToApp,
  KeyboardArrowRight,
  AccountCircle,
  Notifications,
  Security,
  People,
  Chat,
  EmojiEmotions,
  WorkspacePremiumRounded,
} from "@mui/icons-material";
import { Avatar, Checkbox, Divider } from "@mui/material";
import { forwardRef, useState } from "react";
import HeaderNavigation from "../../../common/HeaderNavigation";
import SettingsButton from "./common/SettingsButton";
import useChatStore from "@/pages/chat/store/useChatSelector";
import { LeftColumnScreenType } from "@/pages/chat/types/LeftColumn";
import s from "./SettingsNavigation.module.scss";
import { SettingsScreenType } from "./types";
import { useIntl } from "react-intl";
import IconButton from "@/shared/ui/IconButton";
import { useStableCallback } from "@/shared/hooks/base";
import ConfirmActionModal from "@/entities/ConfirmActionModal";
import buildClassName from "@/shared/lib/buildClassName";

interface OwnProps {
  className?: string;
  onScreenChange?: (screen: SettingsScreenType) => void;
}

const SettingsNavigation = forwardRef<HTMLDivElement, OwnProps>(
  (props, ref) => {
    const { className, onScreenChange } = props;
    const [showExitAccountModal, setShowExitAccountModal] = useState(false);

    const { formatMessage } = useIntl();

    const setScreen = useChatStore((store) => store.setScreen);

    const handleSearchClose = useStableCallback(() => {
      setScreen(LeftColumnScreenType.Main);
    });

    const handleOpenExitAccountModal = useStableCallback(() => {
      setShowExitAccountModal(true);
    });

    const handleCloseExitAccountModal = useStableCallback(() => {
      setShowExitAccountModal(false);
    });

    return (
      <>
        <div
          ref={ref}
          className={buildClassName(className, s.SettingsNavigationScreen)}
        >
          <HeaderNavigation
            className={s.SettingsHeader}
            name={formatMessage({ id: "left.settings" })}
            onPrevClick={handleSearchClose}
          >
            <IconButton size="medium" title="Редактировать профиль">
              <EditRounded />
            </IconButton>
            <IconButton
              size="medium"
              title="Выйти из аккаунта"
              onClick={handleOpenExitAccountModal}
            >
              <ExitToApp />
            </IconButton>
          </HeaderNavigation>

          <section className={s.SettingSection}>
            <div className={s.UserDetails}>
              <Avatar
                className={s.UserAvatar}
                sizes="large"
                src="https://avatars.githubusercontent.com/u/116294957?v=4"
              />
              <h1>Andrii Volynets</h1>
              <p>Apple ID, iCloud, Media & Purchase</p>
              <Divider className={s.Divider}>online (1/2)</Divider>
            </div>
            <ActionButton
              swap
              className={s.UpdateButton}
              icon={<KeyboardArrowRight />}
              label={"Accounts Feature Updates"}
            />
          </section>

          <section className={s.SettingSection}>
            <SettingsButton
              settingIcon={<AccountCircle />}
              settingName={formatMessage({ id: "left.settings.account" })}
              onClick={() => onScreenChange?.(SettingsScreenType.Account)}
            >
              <p>
                {formatMessage({ id: "left.settings.account.description" })}
              </p>
            </SettingsButton>

            <SettingsButton
              settingIcon={<Notifications />}
              settingName={formatMessage({ id: "left.settings.notifications" })}
              onClick={() => onScreenChange?.(SettingsScreenType.Notifications)}
            >
              • Уведомления и звук <br />
              • Общие настройки чата для новых пользователей <br />
              • Общие настройки упоминаний <br />
            </SettingsButton>

            <SettingsButton
              settingIcon={<Security />}
              settingName={formatMessage({ id: "left.settings.privacy" })}
              onClick={() => onScreenChange?.(SettingsScreenType.Confidence)}
            >
              • Настройки конфиденциальности <br />
              • Список заблокированных пользователей <br />
              • Список ограниченных пользователей <br />
              • Скрыть истории и эфиры <br />
              • Настройки взаимодействия во время общения <br />
            </SettingsButton>

            <SettingsButton
              settingIcon={<People />}
              settingName={formatMessage({ id: "left.settings.content" })}
              onClick={() => onScreenChange?.(SettingsScreenType.Interaction)}
            >
              • Близкие друзья <br />
              • Взаимодействие с Вами <br />
              • Общие настройки взаимодействия с Вашим контентом <br />
              • Рекомендации, то что вы видите <br />
            </SettingsButton>

            <SettingsButton
              settingIcon={<Chat />}
              settingName={formatMessage({ id: "left.settings.chats" })}
              onClick={() => onScreenChange?.(SettingsScreenType.Chats)}
            >
              • Папки с чатами <br />
              • Теги чатов <br />
              • Общие настройки приложения <br />
            </SettingsButton>

            <SettingsButton
              settingIcon={<EmojiEmotions />}
              settingName={formatMessage({
                id: "left.settings.personalization",
              })}
              onClick={() =>
                onScreenChange?.(SettingsScreenType.Personalization)
              }
            >
              • Стикеры и эмодзи <br />
            </SettingsButton>
          </section>

          <section className={s.SettingSection}>
            <ActionButton
              className={s.PremiumButton}
              icon={<WorkspacePremiumRounded />}
              label={"AWE+ Free Year Available"}
            />
            <p>
              Included with your recent all device purchase. Must be accepted
              within 90 days of activation.
            </p>
          </section>
        </div>

        <ConfirmActionModal
          backdropBlur
          confirmIsDestructive
          action={formatMessage({ id: "left.settings.exitAccount" })}
          isOpen={showExitAccountModal}
          onClose={handleCloseExitAccountModal}
        >
          <p>{formatMessage({ id: "left.settings.exitAccountDialog" })}</p>
          <Checkbox />
        </ConfirmActionModal>
      </>
    );
  },
);

export default SettingsNavigation;
