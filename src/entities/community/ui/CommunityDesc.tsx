import React from 'react';
import { Box, Typography } from '@mui/material';

interface CommunityDescProps {
  name: string;
  description: React.ReactNode;
}

const CommunityDesc: React.FC<CommunityDescProps> = ({ name, description }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', mt: '-0.25rem' }}>
      <Typography component="h1" fontSize="xl" fontWeight="xl">
        {name}
      </Typography>
      <Typography
        component="h2"
        sx={{
          textOverflow: 'ellipsis',
          wordBreak: 'break-word',
        }}
      >
        {description}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}></Box>
    </Box>
  );
};

export { CommunityDesc };
