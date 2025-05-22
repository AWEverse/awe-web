import { StarBorder } from "@mui/icons-material";
import {
  Link,
  Stack,
  ListItem,
  Avatar,
  Typography,
  AvatarGroup,
  List,
  Box,
} from "@mui/material";

// Основной компонент LeftColumn
const LeftColumn = () => {
  return (
    <Stack
      gap={1}
      sx={{
        position: "relative",
        borderRadius: "md",
        backgroundColor: "background.surface",
      }}
    ></Stack>
  );
};

export default LeftColumn;
