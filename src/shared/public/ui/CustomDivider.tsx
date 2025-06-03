import { Divider, DividerProps } from "@mui/material";
import React from "react";

const CustomDivider: React.FC<DividerProps> = (props) => {
  return (
    <Divider
      sx={{
        height: "2px",
        borderRadius: "xs",
        ...props.sx,
      }}
      {...props}
    />
  );
};

export default CustomDivider;
