import { FC, lazy, memo, Suspense, useEffect, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import buildClassName from "@/shared/lib/buildClassName";
import { LeftColumnScreenType } from "../../types/LeftColumn";
import s from "./LeftColumn.module.scss";
import { usePrevious } from "@/shared/hooks/base";
import ArchivedScreen from "./screens/ArchivedScreen";
import ContactsScreen from "./screens/ContactsScreen";
import MainScreen from "./screens/MainScreen";
import useAppLayout from "@/lib/hooks/ui/useAppLayout";
import useChatStore from "../../store/useChatSelector";
import ScreenProvider, { useLeftScreenNavigation } from "./lib/ScreenContext"; // Використовуємо ScreenContext

const SettingsNavigation = lazy(
  () => import("./screens/settings/SettingsNavigation"),
);
const AccountSetting = lazy(() => import("./screens/settings/AccountSetting"));
const ConfidenceSetting = lazy(
  () => import("./screens/settings/ConfidenceSetting"),
);
const InteractionSetting = lazy(
  () => import("./screens/settings/InteractionSetting"),
);
const NotificationsSetting = lazy(
  () => import("./screens/settings/NotificationsSetting"),
);
const PersonalizationSetting = lazy(
  () => import("./screens/settings/PersonalizationSetting"),
);

const MainSkeleton = () => <div className={s.skeleton}>Main Skeleton</div>;
const SettingsSkeleton = () => (
  <div className={s.skeleton}>Settings Skeleton</div>
);
const GenericSkeleton = () => <div className={s.skeleton}>Loading...</div>;

const screens = {
  ["Main"]: MainScreen,
  ["Archived"]: ArchivedScreen,
  ["Contacts"]: ContactsScreen,
  ["SettingsNavigation"]: SettingsNavigation,
  ["AccountSetting"]: AccountSetting,
  ["ConfidenceSetting"]: ConfidenceSetting,
  ["InteractionSetting"]: InteractionSetting,
  ["NotificationsSetting"]: NotificationsSetting,
  ["PersonalizationSetting"]: PersonalizationSetting,
};

const skeletons = {
  ["Main"]: <MainSkeleton />,
  ["SettingsNavigation"]: <SettingsSkeleton />,
  default: <GenericSkeleton />,
};

const screenVariants = {
  initial: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? "100%" : "-100%",
  }),
  animate: {
    opacity: 1,
    x: 0,
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? "-100%" : "100%",
  }),
};

interface OwnProps {
  className?: string;
}

const LeftColumn: FC<OwnProps> = ({ className }) => {
  const isMobile = useAppLayout((state) => state.isMobile);
  const isLeftPanelOpen = useChatStore((s) => s.isChatList);

  const { currentScreen } = useLeftScreenNavigation();
  const shouldReduceMotion = useReducedMotion();

  const transition = {
    duration: shouldReduceMotion ? 0 : 0.2,
  };

  const ScreenComponent = screens[currentScreen];
  const Fallback = skeletons.default;

  return (
    <section
      data-mobile={isMobile}
      className={buildClassName(s.LeftColumn, className)}
      data-shown={isLeftPanelOpen}
    >
      <AnimatePresence initial={false} mode="popLayout">
        {ScreenComponent && (
          <motion.div
            className="scrollable_area"
            aria-label={`Current screen: ${currentScreen}`}
            key={currentScreen}
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            custom={-1}
            transition={transition}
          >
            <Suspense fallback={Fallback}>
              <ScreenComponent />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default memo(LeftColumn);
