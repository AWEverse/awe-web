import ActionButton from "@/shared/ui/ActionButton";
import DropdownMenu, { TriggerProps } from "@/shared/ui/DropdownMenu";
import IconButton from "@/shared/ui/IconButton";
import { SortByAlpha } from "@mui/icons-material";
import { FC, memo, useState } from "react";
import s from "./ContactsSortDropdown.module.scss";
import useStableCallback from "@/lib/hooks/callbacks/useStableCallback";

interface OwnProps {
  onChange?: (sortType: SortTypes) => void;
}

type SortTypes = "name" | "last_seen" | "status" | "online" | "last_message";

const switchIcon = (sortType: SortTypes) => {
  switch (sortType) {
    case "name":
      return <SortByAlpha />;
    case "last_seen":
      return <SortByAlpha />;
    case "status":
      return <SortByAlpha />;
    case "online":
      return <SortByAlpha />;
    case "last_message":
      return <SortByAlpha />;
  }
};

const ContactsSortDropdown: FC<OwnProps> = (props) => {
  const { onChange } = props;

  const [sortType, setSortType] = useState<SortTypes>("name");

  const handleSortTypeChange = useStableCallback((type: SortTypes) => {
    setSortType(type);
    onChange?.(type);
  });

  const TriggerButton: FC<TriggerProps> = ({ isOpen, onTrigger }) => {
    return (
      <IconButton active={isOpen} onClick={onTrigger}>
        {switchIcon(sortType)}
        <span className={s.SearchType}>{sortType.at(0)}</span>
      </IconButton>
    );
  };

  return (
    <DropdownMenu
      className={s.ContactsSortDropdown}
      position="top-right"
      triggerButton={TriggerButton}
    >
      <ActionButton
        icon={<SortByAlpha />}
        onClick={() => handleSortTypeChange("name")}
      >
        Sort by name
      </ActionButton>
      <ActionButton
        icon={<SortByAlpha />}
        onClick={() => handleSortTypeChange("last_seen")}
      >
        Sort by last seen
      </ActionButton>
      <ActionButton
        icon={<SortByAlpha />}
        onClick={() => handleSortTypeChange("status")}
      >
        Sort by status
      </ActionButton>
      <ActionButton
        icon={<SortByAlpha />}
        onClick={() => handleSortTypeChange("online")}
      >
        Sort by online
      </ActionButton>
      <ActionButton
        icon={<SortByAlpha />}
        onClick={() => handleSortTypeChange("last_message")}
      >
        Sort by last message
      </ActionButton>
    </DropdownMenu>
  );
};

export default memo(ContactsSortDropdown);
