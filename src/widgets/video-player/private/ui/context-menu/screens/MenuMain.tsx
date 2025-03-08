import { FC } from "react";
import { useStableCallback } from "@/shared/hooks/base";
import ActionButton from "@/shared/ui/ActionButton";
import MenuSeparator from "@/shared/ui/MenuSeparator";
import {
  PlayArrowRounded,
  PlaylistAddRounded,
  PlaylistRemoveRounded,
  PostAddRounded,
  QueueMusicRounded,
  ShareRounded,
} from "@mui/icons-material";

export type ActionType =
  | "play"
  | "addToQueue"
  | "addToPlaylist"
  | "removeFromPlayList"
  | "post"
  | "share";

interface OwnProps {
  onClickAction: (actionType: ActionType) => void;
}

type ActionItem =
  | {
      type: "action";
      icon: React.ReactNode;
      label: string;
      actionType: ActionType;
    }
  | {
      type: "separator";
      size: "thick" | "thin" | "thicker";
    };

const actionItems: ActionItem[] = [
  {
    type: "action",
    icon: <PlayArrowRounded />,
    label: "Play",
    actionType: "play",
  },
  {
    type: "separator",
    size: "thick",
  },
  {
    type: "action",
    icon: <QueueMusicRounded />,
    label: "Add to queue",
    actionType: "addToQueue",
  },
  {
    type: "action",
    icon: <PlaylistAddRounded />,
    label: "Add to playlist",
    actionType: "addToPlaylist",
  },
  {
    type: "action",
    icon: <PlaylistRemoveRounded />,
    label: "Remove from playlist",
    actionType: "removeFromPlayList",
  },
  {
    type: "separator",
    size: "thick",
  },
  {
    type: "action",
    icon: <PostAddRounded />,
    label: "Post to",
    actionType: "post",
  },
  {
    type: "action",
    icon: <ShareRounded />,
    label: "Share",
    actionType: "share",
  },
];

const commonButtonProps = {
  size: "sm" as const,
  variant: "contained" as const,
  fullWidth: true,
};

const renderItem = (
  item: ActionItem,
  index: number,
  onClickAction: (actionType: ActionType) => void,
) => {
  if (item.type === "separator") {
    return <MenuSeparator key={`separator-${index}`} size={item.size} />;
  }

  const stableOnClick = useStableCallback(() => onClickAction(item.actionType));

  return (
    <ActionButton
      key={item.actionType}
      {...commonButtonProps}
      onClick={stableOnClick}
    >
      <i>{item.icon}</i>
      <span>{item.label}</span>
    </ActionButton>
  );
};

const MenuMain: FC<OwnProps> = ({ onClickAction }) => {
  return (
    <>
      {actionItems.map((item, index) => renderItem(item, index, onClickAction))}
    </>
  );
};

export default MenuMain;
