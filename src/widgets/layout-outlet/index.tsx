import { Outlet } from "react-router";
import "./index.scss";
import { ScrollProvider } from "@/shared/context";
import { FC, useRef } from "react";
import SearchInput from "@/shared/ui/SearchInput";
import Dropdown, { TriggerProps } from "@/shared/ui/dropdown";
import IconButton from "@/shared/ui/IconButton";
import {
  MenuRounded,
  MicRounded,
  NotificationsRounded,
} from "@mui/icons-material";

const UserTriggerButton: FC<TriggerProps> = ({ onTrigger }) => {
  return (
    <IconButton onClick={onTrigger}>
      <NotificationsRounded />
    </IconButton>
  );
};

const NotificationTriggerButton: FC<TriggerProps> = ({ onTrigger }) => {
  return (
    <IconButton onClick={onTrigger}>
      <NotificationsRounded />
    </IconButton>
  );
};

const LayoutOutlet = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <ScrollProvider containerRef={containerRef}>
      <div className="LayoutOutlet">
        <div className={"LayoutHeader"}>
          <IconButton>
            <MenuRounded />
          </IconButton>
          <SearchInput parentContainerClassName="LayoutHeader__Search" />
          <IconButton>
            <MicRounded />
          </IconButton>
          <Dropdown
            triggerButton={NotificationTriggerButton}
            position="top-right"
          >
            rekfakfksak
          </Dropdown>
          <Dropdown triggerButton={UserTriggerButton} position="top-right">
            rekfakfksak
          </Dropdown>
        </div>
        <div data-scrolled={true} className={"LayoutBody"}>
          <Outlet />
        </div>
      </div>
    </ScrollProvider>
  );
};

export default LayoutOutlet;
