import { CommunityTopic } from '@/entities/community';
import {
  Stack,
  Box,
  Button,
  Typography,
  ButtonGroup,
  Badge,
  badgeClasses,
  Avatar,
} from '@mui/material';
import FlatList from '@/entities/FlatList';

import s from './index.module.scss';
import FavouriteIcon from '@/shared/common/icons/FavouriteIcon';
import CommRecCard from '@/entities/CommRecCard';
import AtSignIcon from '@/shared/common/icons/AtSignIcon';
import IconExpand from '@/shared/ui/IconExpand';
import UserMultipleIcon from '@/shared/common/icons/UserMultipleIcon';
import LastPublisher from '../../ui/LastPublisher';

const communities = [
  {
    title: 'TechInnovators',
    description: 'Technology innovation hub',
    value: '95,431',
  },
  {
    title: 'ArtLoversHub',
    description: 'Community for art enthusiasts',
    value: '95,431',
  },
  {
    title: 'HealthAndWellness',
    description: 'Health and wellness discussions',
    value: '95,431',
  },
  {
    title: 'FitnessFreaks',
    description: 'Fitness and workout tips',
    value: '95,431',
  },
  {
    title: 'BookwormsUnited',
    description: 'For book lovers and readers',
    value: '95,431',
  },
  {
    title: 'GamingLegends',
    description: 'Gaming community',
    value: '95,431',
  },
  {
    title: 'TravelAdventurers',
    description: 'Travel adventures and tips',
    value: '95,431',
  },
  {
    title: 'MusicMakers',
    description: 'Music creation and appreciation',
    value: '95,431',
  },
  {
    title: 'FoodiesCorner',
    description: 'Culinary experiences and recipes',
    value: '95,431',
  },
  {
    title: 'StartupSuccess',
    description: 'Entrepreneurship and startups',
    value: '95,431',
  },
  {
    title: 'PhotographyPros',
    description: 'Photography tips and techniques',
    value: '95,431',
  },
  {
    title: 'PetLovers',
    description: 'Community for pet owners',
    value: '95,431',
  },
  {
    title: 'ScienceGeeks',
    description: 'Science discoveries and facts',
    value: '95,431',
  },
  {
    title: 'MovieBuffs',
    description: 'Film discussions and reviews',
    value: '95,431',
  },
  {
    title: 'DIYCreators',
    description: 'DIY projects and creativity',
    value: '95,431',
  },
];

const OverviewPage: React.FC = () => {
  return (
    <div className={s.root}>
      <section className={s.headerSection}>
        <div className={s.communityWrapper}>
          <Avatar className={s.avatar} src="https://i.pravatar.cc/300" />

          <div className={s.communityInfo}>
            <Typography className={s.communityType} component="h2" variant="h3">
              Community
            </Typography>
            <Typography className={s.communityTitle} component="h1" variant="h1">
              TechInnovators
            </Typography>
            <Typography className={s.communityDesc} component="p" variant="body2">
              A community for discussing anything related to the React UI framework and its
              ecosystem. Join the Reactiflux Discord (reactiflux.com) for additional React
              discussion and help.
            </Typography>
          </div>
        </div>

        <div className={s.communityActions}>
          <section className={s.mainActions}>
            <Button className={s.interactionButton} size="small">
              Follow
            </Button>
            <Button className={s.interactionButton} size="small">
              Share
            </Button>
          </section>

          <section className={s.metaContainer}>
            <div className={s.metaIconWrapper}>
              <IconExpand icon={<AtSignIcon size={28} />} label="@TechInnovators" />
              <IconExpand icon={<FavouriteIcon size={24} />} label="Favourite" />
              <IconExpand icon={<UserMultipleIcon size={24} />} label="3.5k Members" />
            </div>
          </section>
        </div>
      </section>

      <Badge
        badgeContent={<>&nbsp;?&nbsp;</>}
        sx={{
          [`.${badgeClasses.badge}`]: {
            '&:hover': { cursor: 'pointer', bgcolor: 'background.level3' },
          },
        }}
      >
        <Stack direction={'row'} gap={1} sx={{ overflow: 'auto' }}>
          <FlatList
            disableWrapper
            horizontal
            data={communities}
            keyExtractor={item => item.title}
            renderItem={({ title, value, description }) => (
              <CommRecCard
                avatarSrc="https://i.pravatar.cc/300"
                desc={description}
                title={title}
                value={value}
              />
            )}
          />
        </Stack>
      </Badge>

      <Box
        gap={2}
        sx={{
          display: { xs: 'flex', small: 'grid' },
          flexDirection: { xs: 'column-reverse', small: 'unset' },
          gridTemplateColumns: {
            xs: '1fr',
            small: '1fr minmax(200px, 250px)',
            md: '1fr  minmax(300px, 350px) ',
            lg: '1fr  minmax(350px, 400px) ',
          },
        }}
      >
        <Stack gap={2}>
          <Typography
            component="li"
            fontWeight="lg"
            variant="body1"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              justifyContent: 'space-between',
            }}
            textTransform="uppercase"
          >
            <ButtonGroup>
              <Button>Oldest</Button>
              <Button>Newest</Button>
              <Button>Relevance</Button>
            </ButtonGroup>
          </Typography>

          <CommunityTopic.Root className="flex flex-col gap-2">
            {[...Array(4).keys()].map(i => (
              <CommunityTopic.Item key={i}>
                <CommunityTopic.TextSection
                  author="[ymleung314](https://github.com/ymleung314)"
                  categories={[
                    '[CryEngine](https://github.com/cryengine/cryengine)',
                    '[C++](https://github.com/cryengine/cryengine)',
                  ]}
                  categoryIcon="📦"
                  question="How to set up the preferences of CryEngine? This is a very important question. I want to know how to set up the preferences of CryEngine?"
                  title="How to setup CryEngine?"
                  topicName="[Getting Started & Setup](https://github.com/cryengine/cryengine)"
                />
              </CommunityTopic.Item>
            ))}
          </CommunityTopic.Root>

          <Typography fontWeight="lg" variant="h2">
            Forum Highlights
          </Typography>
        </Stack>

        <Stack gap={2}>
          <FlatList
            data={[
              {
                title: 'TechInnovators',
                description:
                  '[2022-12-12](https://github.com/cryengine/cryengine) published this topic [Programming & Scripting](https://github.com/cryengine/cryengine)',
              },
            ]}
            keyExtractor={item => item.title}
            renderItem={({ title, description }) => (
              <LastPublisher
                avatarSrc="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80"
                dateText={description}
                title={title}
              />
            )}
          />
        </Stack>
      </Box>
    </div>
  );
};

export default OverviewPage;
