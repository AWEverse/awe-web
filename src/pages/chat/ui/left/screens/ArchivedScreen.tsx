import buildClassName from "@/shared/lib/buildClassName";
import { FC } from "react";
import HeaderNavigation from "../../common/HeaderNavigation";
import useChatStore from "@/pages/chat/store/useChatSelector";
import { LeftColumnScreenType } from "@/pages/chat/types/LeftColumn";
import { useStableCallback } from "@/shared/hooks/base";

interface OwnProps {
  className?: string;
}

interface StateProps {}

const ArchivedScreen: FC<OwnProps & StateProps> = (props) => {
  const { className } = props;

  const setScreen = useChatStore((store) => store.setScreen);

  const handleSearchClose = useStableCallback(() => {
    setScreen(LeftColumnScreenType.Main);
  });

  return (
    <div className={buildClassName(className)}>
      <HeaderNavigation onPrevClick={handleSearchClose}>
        Achive
      </HeaderNavigation>
    </div>
  );
};

export default ArchivedScreen;
