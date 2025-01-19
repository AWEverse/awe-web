import { FC, ReactNode } from "react";
import HeaderNavigation from "../../common/HeaderNavigation";
import { SettingsScreenType } from "../screens/settings/types";
import useLastCallback from "@/lib/hooks/callbacks/useLastCallback";

interface OwnProps {
  ref?: React.RefObject<HTMLDivElement>;
  className?: string;
  title: string;
  defaultScreen?: SettingsScreenType;
  onScreenChange?: (screen: SettingsScreenType) => void;
  children: ReactNode;
}

const ScreenTemplate: FC<OwnProps> = (props) => {
  const {
    ref,
    className,
    title,
    defaultScreen = SettingsScreenType.SettingsNavigation,
    onScreenChange,
    children,
  } = props;

  const handleScreenChange = useLastCallback(() => {
    onScreenChange?.(defaultScreen);
  });

  return (
    <div ref={ref} className={className}>
      <HeaderNavigation name={title} onPrevClick={handleScreenChange} />
      {children}
    </div>
  );
};

export default ScreenTemplate;
