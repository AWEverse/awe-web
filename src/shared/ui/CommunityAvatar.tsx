import React from 'react';
import { Badge, Tooltip, AspectRatio } from '@mui/material';
import { Check } from '@mui/icons-material';

interface CommunityAvatarProps {
  src: string;
  verified?: boolean;
}

const CommunityAvatar: React.FC<CommunityAvatarProps> = ({ src, verified = false }) => {
  return (
    <Badge
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      badgeContent={
        verified ? (
          <Tooltip arrow placement="left" sx={{ cursor: 'pointer' }} title="Verified">
            <Check />
          </Tooltip>
        ) : null
      }
      color="success"
      size="sm"
      sx={{
        width: { xs: 60, sm: 80, md: 100 },
        height: { xs: 60, sm: 80, md: 100 },
      }}
      variant="outlined"
    >
      <AspectRatio flex ratio="1" sx={{ borderRadius: 'sm' }}>
        <img alt="" loading="lazy" src={src} srcSet={`${src}?auto=format&fit=crop&w=286&dpr=2 2x`} />
      </AspectRatio>
    </Badge>
  );
};

export default CommunityAvatar;
