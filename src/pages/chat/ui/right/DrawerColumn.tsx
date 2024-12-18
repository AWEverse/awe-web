import { FC, memo } from 'react';
import { Drawer } from '@mui/material';

import useChatStore from '../../store/useChatSelector';

interface OwnProps {
  children: React.ReactNode;
  className?: string;
}

const DrawerColumn: FC<OwnProps> = props => {
  const isOpen = useChatStore(state => state.isProfileColumn);
  const handleClose = useChatStore(state => state.closeProfileColumn);

  const { children } = props;

  return (
    <Drawer
      PaperProps={{
        sx: {
          minHeight: '100dvh',
          minWidth: { xs: '100vw', sm: '420px' },
          maxWidth: '420px',
          p: { xs: 0, sm: '1rem 1rem 2rem 1rem' },
          boxShadow: 'none',
          overflow: 'hidden',
        },
      }}
      anchor="right"
      open={isOpen}
      onClose={handleClose}
    >
      {isOpen && children}
    </Drawer>
  );
};

export default memo(DrawerColumn);
