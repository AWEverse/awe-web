import { FC, lazy, memo, Suspense } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import buildClassName from "@/shared/lib/buildClassName";
import useChatStore from "../../store/useChatSelector";
import { LeftColumnScreenType } from "../../types/LeftColumn";
import s from "./LeftColumn.module.scss";
import { usePrevious } from "@/shared/hooks/base";
import ArchivedScreen from "./screens/ArchivedScreen";
import ContactsScreen from "./screens/ContactsScreen";
import MainScreen from "./screens/MainScreen";

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
const Skeleton = () => <div className={s.skeleton}>Generic Skeleton</div>;

const screens = {
  [LeftColumnScreenType.Main]: MainScreen,
  [LeftColumnScreenType.Archived]: ArchivedScreen,
  [LeftColumnScreenType.Contacts]: ContactsScreen,
  [LeftColumnScreenType.SettingsNavigation]: SettingsNavigation,
  [LeftColumnScreenType.AccountSetting]: AccountSetting,
  [LeftColumnScreenType.ConfidenceSetting]: ConfidenceSetting,
  [LeftColumnScreenType.InteractionSetting]: InteractionSetting,
  [LeftColumnScreenType.NotificationsSetting]: NotificationsSetting,
  [LeftColumnScreenType.PersonalizationSetting]: PersonalizationSetting,
};

const skeletons = {
  [LeftColumnScreenType.Main]: <MainSkeleton />,
  [LeftColumnScreenType.SettingsNavigation]: <SettingsSkeleton />,
  default: <Skeleton />,
};

const screenVariants = {
  initial: (direction: boolean) => ({
    opacity: 0,
    x: direction ? "100%" : "-100%",
  }),
  animate: {
    opacity: 1,
    x: 0,
  },
  exit: (direction: boolean) => ({
    opacity: 0,
    x: direction ? "100%" : "-100%",
  }),
};

interface OwnProps {
  className?: string;
}

const LeftColumn: FC<OwnProps> = ({ className }) => {
  const isOpen = useChatStore((state) => state.isChatList);
  const currentScreen = useChatStore((state) => state.screen);

  const shouldReduceMotion = useReducedMotion();
  const prevScreen = usePrevious(currentScreen);

  const ScreenComponent = screens[currentScreen];
  const Fallback = skeletons.default;

  return (
    <AnimatePresence initial={false} mode="popLayout">
      {ScreenComponent && (
        <motion.div
          className={buildClassName(s.LeftColumn, className)}
          data-placement={isOpen ? "show" : "hide"}
          aria-label={`Current screen: ${currentScreen}`}
          key={currentScreen}
          variants={screenVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          custom={(prevScreen || 0) < currentScreen}
          transition={
            shouldReduceMotion ? { duration: 0 } : { duration: 0.125 }
          }
        >
          <Suspense fallback={Fallback}>
            <ScreenComponent />
          </Suspense>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default memo(LeftColumn);
