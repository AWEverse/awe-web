import { FC, useState } from "react";

import s from "./SortActions.module.scss";
import { useStableCallback } from "@/shared/hooks/base";
import DropdownMenu, { TriggerProps } from "@/shared/ui/dropdown";
import IconButton from "@/shared/ui/IconButton";
import ActionButton from "@/shared/ui/ActionButton";
import {
  AccountCircle,
  AccountBox,
  Logout,
  SortOutlined,
  SortByAlpha,
} from "@mui/icons-material";

type Order = "asc" | "desc";

interface OwnProps {
  className?: string;
  onClick?: () => void;
}

const reverseOrder = (order: Order) => (order === "asc" ? "desc" : "asc");

const SortActions: FC<OwnProps> = (props) => {
  const { className } = props;

  const [order, setOrder] = useState<Order>("desc");

  const handleOrderChange = useStableCallback(() => {
    setOrder((prev) => reverseOrder(prev));
  });

  const renderIcon = useStableCallback(() =>
    order === "desc" ? <SortOutlined /> : <SortByAlpha />,
  );

  const TriggerButton: FC<TriggerProps> = ({ isOpen, onTrigger }) => (
    <IconButton active={isOpen} size="medium" onClick={onTrigger}>
      {renderIcon()}
    </IconButton>
  );

  return (
    <DropdownMenu
      className={className}
      position="top-right"
      triggerButton={TriggerButton}
    >
      <ActionButton className={s.menuItem} icon={<AccountCircle />}>
        Profile
      </ActionButton>
      <ActionButton className={s.menuItem} icon={<AccountBox />}>
        My account
      </ActionButton>
      <ActionButton className={s.menuItem} icon={<Logout />}>
        Logout
      </ActionButton>

      <hr className={s.separator} />

      <ActionButton
        className={s.menuItem}
        icon={renderIcon()}
        onClick={handleOrderChange}
      >
        Set order: {order}
      </ActionButton>
    </DropdownMenu>
  );
};

export default SortActions;
