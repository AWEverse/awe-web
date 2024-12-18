import { ChatLayout } from './ui';
import RightColumn from './ui/right/RightColumn';
import LeftColumn from './ui/left/LeftColumn';
import MiddleColumn from './ui/middle/MiddleColumn';

import './index.css';
import { FC, memo } from 'react';
import UserMultipleIcon from '@/shared/common/icons/UserMultipleIcon';
import ActionButton from '@/shared/ui/ActionButton';
import { Box, Stack } from '@mui/material';

const ChatPage: FC = () => {
  return (
    <ChatLayout.Root>
      <ChatLayout.Main>
        <LeftColumn />
        <MiddleColumn />
        <RightColumn />
      </ChatLayout.Main>

      <ChatLayout.Footer>
        <Box
          sx={{
            borderTop: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            px: 1,
            alignItems: 'center',
            zIndex: 100,
            height: '100%',
            backgroundColor: 'gray',
          }}
        >
          <Stack>
            <ActionButton
              className="text-xs"
              icon={<UserMultipleIcon size={16} />}
              label="@andrii_volynets"
            />
          </Stack>
        </Box>
      </ChatLayout.Footer>
    </ChatLayout.Root>
  );
};

export default memo(ChatPage);
