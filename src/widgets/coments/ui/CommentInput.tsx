import { Box, Button, Divider, Input, Option, Select, Stack, Tooltip } from '@mui/material';
import { Dropdown, Menu, MenuButton, MenuItem } from '@mui/material';
import Textarea from '@mui/material/Textarea';
import { FormatColorFill, FormatColorText, Functions, VerticalSplit } from '@mui/icons-material';
import React from 'react';

interface DropdownMenuProps {
  icon: JSX.Element;
  children: JSX.Element;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ icon, children }) => {
  return (
    <Dropdown>
      <MenuButton sx={{ px: 1 }}>{icon}</MenuButton>
      <Menu>{children}</Menu>
    </Dropdown>
  );
};

const FormulaMenu = () => (
  <DropdownMenu icon={<Functions />}>
    <>
      <MenuItem>Profile</MenuItem>
      <MenuItem>My account</MenuItem>
      <MenuItem>Logout</MenuItem>
    </>
  </DropdownMenu>
);

const ColorTextMenu = () => (
  <DropdownMenu icon={<FormatColorText />}>
    <Tooltip title="Font">
      <MenuItem>
        <Stack direction="row" spacing="sm">
          <Box>
            <Input
              endDecorator={
                <React.Fragment>
                  <Divider orientation="vertical" />
                  <Select sx={{ mr: -1.5, '&:hover': { bgcolor: 'transparent' } }} variant="plain">
                    <Option value="">US dollar</Option>
                    <Option value="">Thai baht</Option>
                    <Option value="">Japanese yen</Option>
                  </Select>
                </React.Fragment>
              }
              placeholder="Amount"
              sx={{ width: 300 }}
            />
          </Box>
          <Box></Box>
          <Box></Box>
        </Stack>
      </MenuItem>
    </Tooltip>
  </DropdownMenu>
);

const VerticalSplitMenu = () => (
  <DropdownMenu icon={<VerticalSplit />}>
    <>
      <MenuItem>Profile</MenuItem>
      <MenuItem>My account</MenuItem>
      <MenuItem>Logout</MenuItem>
    </>
  </DropdownMenu>
);

const ColorFillMenu = () => (
  <DropdownMenu icon={<FormatColorFill />}>
    <>
      <MenuItem>Profile</MenuItem>
      <MenuItem>My account</MenuItem>
      <MenuItem>Logout</MenuItem>
    </>
  </DropdownMenu>
);

const EditorToolbar = () => (
  <Box
    sx={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
      justifyContent: 'space-between',
    }}
  >
    <Stack direction="row" gap={1}>
      <ColorTextMenu />
      <VerticalSplitMenu />
      <ColorFillMenu />
      <FormulaMenu />
    </Stack>
    <Button>Send</Button>
  </Box>
);

export default function CommentInput() {
  return <Textarea endDecorator={<EditorToolbar />} maxRows={4} minRows={2} placeholder="Type in here…" sx={{}} />;
}
