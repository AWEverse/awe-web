import { FC, memo } from "react";
import { ChatLayout } from "./ui";
import RightColumn from "./ui/right/RightColumn";
import LeftColumn from "./ui/left/LeftColumn";
import MiddleColumn from "./ui/middle/MiddleColumn";

import "./index.css";

const ChatPage: FC = () => {
  return (
    <ChatLayout.Root>
      <LeftColumn />
      <MiddleColumn />
      <RightColumn />
    </ChatLayout.Root>
  );
};

export default memo(ChatPage);
