import { useState } from "react";
import {
  Box,
  IconButtonProps,
  Drawer,
  DrawerProps,
  IconButton,
  Sheet,
} from "@mui/material";
import useMedia from "@/lib/hooks/ui/useMedia";
import { useStableCallback } from "@/shared/hooks/base";

interface CustomDrawerProps {
  children: React.ReactNode;
  buttonProps?: IconButtonProps;
  drawerProps?: DrawerProps;
}

const DrawerBasic: React.FC<CustomDrawerProps> = ({
  children,
  buttonProps,
  drawerProps,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const isMobile = useMedia("(max-width: 600px)");

  const toggleDrawer = useStableCallback(() =>
    setOpen((prevOpen) => !prevOpen),
  );

  const drawerContentStyles = {
    height: isMobile ? "100vh" : "100%",
    width: isMobile ? "100vw" : undefined,
    bgcolor: "transparent",
    p: { md: 3, sm: 0 },
    boxShadow: "none",
  };

  const sheetStyles = {
    borderRadius: "md",
    p: 2,
    display: "flex",
    flexDirection: "column",
    gap: 2,
    height: "100%",
    overflow: "auto",
  };

  return (
    <Box sx={{ display: "flex" }}>
      <IconButton {...buttonProps} onClick={toggleDrawer}>
        {buttonProps?.children || "Open Drawer"}
      </IconButton>
      <Drawer
        {...drawerProps}
        anchor={isMobile ? "top" : "right"}
        open={open}
        slotProps={{
          content: {
            sx: drawerContentStyles,
          },
        }}
        variant="plain"
        onClose={toggleDrawer}
      >
        {open && <Sheet sx={sheetStyles}>{children}</Sheet>}
      </Drawer>
    </Box>
  );
};

export default DrawerBasic;
