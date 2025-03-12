import { FC, lazy, memo, Suspense, useEffect, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import buildClassName from "@/shared/lib/buildClassName";
import { LeftColumnScreenType } from "../../types/LeftColumn";
import s from "./LeftColumn.module.scss";
import { usePrevious } from "@/shared/hooks/base";
import ArchivedScreen from "./screens/ArchivedScreen";
import ContactsScreen from "./screens/ContactsScreen";
import MainScreen from "./screens/MainScreen";
import useChatStore from "../../store/state/useChatState";
import useAppLayout from "@/lib/hooks/ui/useAppLayout";

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
  default: <GenericSkeleton />,
};

// Animation variants
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

  const { isLeftPanelOpen } = useChatStore();

  const currentScreen = LeftColumnScreenType.Main;
  const prevScreen = usePrevious(currentScreen);
  const shouldReduceMotion = useReducedMotion();

  const direction = useMemo(() => {
    const screenOrder = [
      LeftColumnScreenType.Main,
      LeftColumnScreenType.Archived,
      LeftColumnScreenType.Contacts,
      LeftColumnScreenType.SettingsNavigation,
      LeftColumnScreenType.AccountSetting,
      LeftColumnScreenType.ConfidenceSetting,
      LeftColumnScreenType.InteractionSetting,
      LeftColumnScreenType.NotificationsSetting,
      LeftColumnScreenType.PersonalizationSetting,
    ];

    const prevIndex = screenOrder.indexOf(
      prevScreen || LeftColumnScreenType.Main,
    );

    const currentIndex = screenOrder.indexOf(currentScreen);
    return currentIndex > prevIndex ? 1 : -1;
  }, [currentScreen, prevScreen]);

  const transition = {
    duration: shouldReduceMotion ? 0 : 0.3,
    ease: "easeInOut",
  };

  const ScreenComponent = screens[currentScreen];
  const Fallback = skeletons[currentScreen] || skeletons.default;

  return (
    <section
      data-mobile={isMobile}
      className={buildClassName(s.LeftColumn, className)}
      data-shown={isLeftPanelOpen}
    >
      <AnimatePresence initial={false} mode="wait">
        {ScreenComponent && (
          <motion.div
            aria-label={`Current screen: ${currentScreen}`}
            key={currentScreen}
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            custom={direction}
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
