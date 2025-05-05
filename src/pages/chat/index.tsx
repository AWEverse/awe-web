import { FC, memo } from "react";
import { ChatLayout } from "./ui";
import RightColumn from "./ui/right/RightColumn";
import LeftColumn from "./ui/left/LeftColumn";
import MiddleColumn from "./ui/middle/MiddleColumn";

import "./index.css";
import ScreenProvider from "./ui/left/lib/ScreenContext";

const ChatPage: FC = () => {
  return (
    <ScreenProvider>
      <ChatLayout.Root>
        <LeftColumn />

        <MiddleColumn />
        <RightColumn />
      </ChatLayout.Root>
    </ScreenProvider>
  );
};

export default memo(ChatPage);
