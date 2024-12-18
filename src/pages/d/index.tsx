import { Box, Link, Stack } from '@mui/material';
import { Outlet } from 'react-router-dom';

const RedditPage = () => {
  return (
    <Box
      sx={{
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        pt: 1,
        pb: 2,
        height: '100dvh',
        width: '100dvw',
        px: { xs: 1, sm: 4, md: 8, lg: 16 },
        gap: 1,

        '.TabLink': {
          mr: 0.5,
          p: '0.25rem 0.5rem',
          border: '1px solid solid',
          borderColor: 'divider',
          borderRadius: 'lg',
          bgcolor: 'background.level1',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      }}
    >
      <Stack direction={'row'}>
        <Link className="TabLink" href="/d/overview">
          Overview
        </Link>
        <Link className="TabLink" href="/d/disscusions">
          Disscusions
        </Link>
        <Link className="TabLink" href="/d/members">
          Members
        </Link>
      </Stack>
      <Outlet />
    </Box>
  );
};

export default RedditPage;
