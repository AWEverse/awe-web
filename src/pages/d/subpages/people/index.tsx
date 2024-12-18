import MemberCard from '@/entities/MemberCard';
import { Stack, Box } from '@mui/material';
import FlatList from '@/entities/FlatList';

const users = [
  {
    joinDate: '21/12/2022',
    avatar: 'https://i.pravatar.cc/1',
    username: 'Albin',
    description: '@albin',
  },
  {
    joinDate: '15/01/2023',
    avatar: 'https://i.pravatar.cc/2',
    username: 'Bella',
    description: '@bella',
  },
  {
    joinDate: '08/02/2023',
    avatar: 'https://i.pravatar.cc/3',
    username: 'Carlos',
    description: '@carlos',
  },
  {
    joinDate: '12/03/2023',
    avatar: 'https://i.pravatar.cc/4',
    username: 'Diana',
    description: '@diana',
  },
  {
    joinDate: '25/04/2023',
    avatar: 'https://i.pravatar.cc/5',
    username: 'Ethan',
    description: '@ethan',
  },
  {
    joinDate: '30/05/2023',
    avatar: 'https://i.pravatar.cc/6',
    username: 'Fiona',
    description: '@fiona',
  },
  {
    joinDate: '14/06/2023',
    avatar: 'https://i.pravatar.cc/7',
    username: 'George',
    description: '@george',
  },
  {
    joinDate: '19/07/2023',
    avatar: 'https://i.pravatar.cc/8',
    username: 'Hannah',
    description: '@hannah',
  },
  {
    joinDate: '02/08/2023',
    avatar: 'https://i.pravatar.cc/9',
    username: 'Ivan',
    description: '@ivan',
  },
  {
    joinDate: '16/09/2023',
    avatar: 'https://i.pravatar.cc/10',
    username: 'Jasmine',
    description: '@jasmine',
  },
];

const CommunityPeoplePage = () => {
  return (
    <Stack>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
        }}
      ></Box>
      <Box
        display="grid"
        sx={{
          py: 1,
          gap: 2.5,
          width: '100%',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'minmax(300px, 500px) minmax(150px, 200px)',
            md: 'minmax(500px, 1fr)  minmax(200px, 250px) ',
          },
        }}
      >
        <FlatList
          data={users}
          keyExtractor={(item, index) => `${item.username}+${index}`}
          renderItem={item => (
            <MemberCard
              avatar={item.avatar}
              username={item.username}
              description={item.description}
              joinDate={item.joinDate}
            />
          )}
        />
      </Box>
    </Stack>
  );
};

export default CommunityPeoplePage;
