import ThreadCard from '@/entities/thread-card';
import { Box, Typography } from '@mui/material';
import ThreadTags from './ThreadTags';
import FlatList from '@/entities/FlatList';

const MainPage = () => {
  return (
    <Box
      sx={{
        pt: 1,
        pb: 2,
        width: '100dvw',
        px: { xs: 1, sm: 8, md: 16, lg: 24 },
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      <ThreadTags items={['For you', 'Subscriptions', 'You marked as important', 'Liked by you', 'Replies', 'Saved']} />

      <Typography level="h2">Branches for you</Typography>

      <FlatList
        data={data}
        keyExtractor={(item, index) => `item-${index}-${item.userName}`}
        renderItem={item => <ThreadCard {...item} />}
      />
    </Box>
  );
};

export { MainPage };

const data = [
  {
    userAvatarSrc: 'https://mui.com/static/images/avatar/2.jpg',
    userName: 'Andrii Volynets',
    userTitle: '2 часа назад',
    userSubtitle:
      'Потрепанная посылка прибыла, её загадочное послание намекает на забытое приключение. Какие секреты ждут впереди? Пыльный пакет, полузабытый в углу. Смел ли ты раскрыть его тайны? Может быть, это начало великого путешествия? Или это всего лишь мираж?',
    userAvatarsSrc: [
      'https://mui.com/static/images/avatar/2.jpg',
      'https://mui.com/static/images/avatar/2.jpg',
      'https://mui.com/static/images/avatar/2.jpg',
    ],
    metaText:
      'Reply by [Andrii Volynets](https://twitter.com/andrii_volynets) and [3 others](https://twitter.com/andrii_volynets) in [4 comments](https://twitter.com/andrii_volynets)',
  },
  {
    userAvatarSrc: 'https://mui.com/static/images/avatar/2.jpg',
    userName: 'Andrii Volynets',
    userTitle: '2 часа назад',
    userSubtitle:
      'Потрепанная посылка прибыла, её загадочное послание намекает на забытое приключение. Какие секреты ждут впереди? Пыльный пакет, полузабытый в углу. Смел ли ты раскрыть его тайны? Может быть, это начало великого путешествия? Или это всего лишь мираж?',
    userAvatarsSrc: [
      'https://mui.com/static/images/avatar/2.jpg',
      'https://mui.com/static/images/avatar/2.jpg',
      'https://mui.com/static/images/avatar/2.jpg',
    ],
    metaText:
      'Reply by [Andrii Volynets](https://twitter.com/andrii_volynets) and [3 others](https://twitter.com/andrii_volynets) in [4 comments](https://twitter.com/andrii_volynets)',
  },
  {
    userAvatarSrc: 'https://mui.com/static/images/avatar/2.jpg',
    userName: 'Andrii Volynets',
    userTitle: '2 часа назад',
    userSubtitle:
      'Потрепанная посылка прибыла, её загадочное послание намекает на забытое приключение. Какие секреты ждут впереди? Пыльный пакет, полузабытый в углу. Смел ли ты раскрыть его тайны? Может быть, это начало великого путешествия? Или это всего лишь мираж?',
    userAvatarsSrc: [
      'https://mui.com/static/images/avatar/2.jpg',
      'https://mui.com/static/images/avatar/2.jpg',
      'https://mui.com/static/images/avatar/2.jpg',
    ],
    metaText:
      'Reply by [Andrii Volynets](https://twitter.com/andrii_volynets) and [3 others](https://twitter.com/andrii_volynets) in [4 comments](https://twitter.com/andrii_volynets)',
  },
  {
    userAvatarSrc: 'https://mui.com/static/images/avatar/2.jpg',
    userName: 'Andrii Volynets',
    userTitle: '2 часа назад',
    userSubtitle:
      'Потрепанная посылка прибыла, её загадочное послание намекает на забытое приключение. Какие секреты ждут впереди? Пыльный пакет, полузабытый в углу. Смел ли ты раскрыть его тайны? Может быть, это начало великого путешествия? Или это всего лишь мираж?',
    userAvatarsSrc: [
      'https://mui.com/static/images/avatar/2.jpg',
      'https://mui.com/static/images/avatar/2.jpg',
      'https://mui.com/static/images/avatar/2.jpg',
    ],
    metaText:
      'Reply by [Andrii Volynets](https://twitter.com/andrii_volynets) and [3 others](https://twitter.com/andrii_volynets) in [4 comments](https://twitter.com/andrii_volynets)',
  },
];
