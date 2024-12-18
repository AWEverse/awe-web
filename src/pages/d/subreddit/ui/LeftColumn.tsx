import { CommunityCard } from '@/entities/community';
import { StarBorder } from '@mui/icons-material';
import { Link, Stack, ListItem, Avatar, Typography, AvatarGroup, List, Box } from '@mui/material';

// Основной компонент LeftColumn
const LeftColumn = () => {
  return (
    <Stack
      gap={1}
      sx={{
        position: 'relative',
        borderRadius: 'md',
        backgroundColor: 'background.surface',
      }}
    >
      {/* Компонент CommunityCardInfo */}
      <CommunityCard
        avatarCommunity={'https://picsum.photos/200'}
        avatars={[
          'https://picsum.photos/200',
          'https://picsum.photos/200',
          'https://picsum.photos/200',
          'https://picsum.photos/200',
          'https://picsum.photos/200',
        ]}
        communityDesc="Community for all Ukrainian-speakers worldwide to freely communicate in Ukrainian language."
        communityName="UkraineHub"
        membersInfo={[
          {
            count: 3,
            label: 'Members',
          },
          {
            count: 3,
            label: 'Online',
          },
          {
            count: 3,
            label: 'Posts',
          },
        ]}
      />
    </Stack>
  );
};

export default LeftColumn;
