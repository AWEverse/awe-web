import { FC, lazy, memo, Suspense, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import buildClassName from "@/shared/lib/buildClassName";
import useChatStore from "../../store/useChatSelector";
import { LeftColumnScreenType } from "../../types/LeftColumn";
import s from "./LeftColumn.module.scss";
import { usePrevious } from "@/shared/hooks/base";
import { useSwipeable } from "@/lib/hooks/events/useSwipeable";

const MainScreen = lazy(() => import("./screens/MainScreen"));
const ArchivedScreen = lazy(() => import("./screens/ArchivedScreen"));
const ContactsScreen = lazy(() => import("./screens/ContactsScreen"));
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
    x: direction ? 0 : -100,
  }),
  animate: {
    opacity: 1,
    x: 0,
  },
  exit: (direction: boolean) => ({
    opacity: 0,
    x: direction ? 0 : -100,
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

  useEffect(() => {
    if (currentScreen === LeftColumnScreenType.SettingsNavigation) {
      import("./screens/settings/AccountSetting");
    }
  }, [currentScreen]);

  const { onMouseDown } = useSwipeable({
    onSwipedLeft: () => {
      // Add forward navigation logic here (e.g., go to next screen)
    },
    onSwipedRight: () => {
      // Add backward navigation logic here (e.g., go back)
    },
    delta: 10, // Minimum distance for swipe to register
  });

  return (
    <AnimatePresence initial={false} mode="popLayout">
      {ScreenComponent && (
        <motion.div
          onMouseDown={onMouseDown}
          className={buildClassName(s.LeftColumn, className)}
          data-placement={isOpen ? "show" : "hide"}
          aria-label={`Current screen: ${currentScreen}`}
          key={currentScreen}
          variants={screenVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          custom={prevScreen! < currentScreen}
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
