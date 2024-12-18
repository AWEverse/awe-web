import AlbumLayout from '@/entities/album-layout/ui/AlbumLayout';
import InputButton from '@/pages/chat/ui/middle/widgets/MiddleMessageList/InputButton';
import ArrowTurnBackwardIcon from '@/shared/common/icons/ArrowTurnBack';
import { CommentItem } from '@/widgets/coments';
import CommentList from '@/widgets/coments/ui/CommentList';
import { Box, Divider, Stack, Typography, Breadcrumbs, Link, IconButton } from '@mui/material';

const NatureEssay = () => {
  return (
    <Stack gap={1}>
      <p>
        Величие природы всегда поражало человечество своим неповторимым красотами и богатством. От могучих гор до бескрайних
        просторов океанов, природа вдохновляет нас своим многообразием и величием.
      </p>
      <Box
        alt="Mountain landscape"
        component={'img'}
        src={'https://picsum.photos/400/300?three'}
        sx={{ borderRadius: 'md', maxHeight: '250px', maxWidth: '250px' }}
      />
      <p>
        Путешествуя по лесам, мы встречаем удивительных обитателей: птиц, зверей, насекомых. Их разнообразие и красота напоминают
        нам о важности сохранения природы и биоразнообразия.
      </p>
      <AlbumLayout variant="masonry">
        <div>
          <img alt="One" src="https://picsum.photos/300/300?one" />
        </div>
        <div>
          <img alt="One" src="https://picsum.photos/200/300?one" />
        </div>
        <div>
          <img alt="One" src="https://picsum.photos/400/300?" />
        </div>
        <div>
          <img alt="One" src="https://picsum.photos/300/300?one" />
        </div>
        <div>
          <img alt="One" src="https://picsum.photos/200/300?one" />
        </div>
        <div>
          <img alt="One" src="https://picsum.photos/400/500?one" />
        </div>
        <div>
          <img alt="One" src="https://picsum.photos/100/100?one" />
        </div>{' '}
        <div>
          <img alt="One" src="https://picsum.photos/400/300?one" />
        </div>
      </AlbumLayout>
      <p>
        Океаны, как огромные водные просторы, скрывают в себе тайны и загадки. Их глубины обитают удивительные существа, а их
        поверхность удивляет своей красотой и мощью.
      </p>
      <Box
        alt="Ocean view"
        component={'img'}
        src={'https://picsum.photos/400/300/?sea'}
        sx={{ borderRadius: 'md', maxHeight: '250px', maxWidth: '250px' }}
      />
      <p>
        Встречаясь с природой во всех ее проявлениях, мы учимся ценить красоту, заботиться о окружающей среде и стремиться к
        гармонии с ней.
      </p>
    </Stack>
  );
};

const SingleThread = () => {
  return (
    <Box
      sx={{
        pt: 1,
        pb: 2,
        width: '100dvw',
        px: { xs: 2, sm: 16, md: 24, lg: 36 },
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            onClick={() => {
              window.history.back();
            }}
          >
            <ArrowTurnBackwardIcon size={24} />
          </IconButton>
          <Stack>
            <Typography level="body-lg">Branch: Nature</Typography>
            <Typography level="body-sm">891 views</Typography>
          </Stack>
        </Box>
        <IconButton sx={{ px: 1 }}></IconButton>
      </Box>

      <Divider />

      <Breadcrumbs aria-label="breadcrumbs" separator="—" size="small" sx={{ p: 0 }}>
        {['Threads', 'Andrii Volynet', 'Post'].map(item => (
          <Link key={item} color="neutral" href="#sizes">
            {item}
          </Link>
        ))}
      </Breadcrumbs>

      <CommentItem
        date={'2024-02-05'}
        id={'1'}
        src={'https://picsum.photos/200'}
        text={<NatureEssay />}
        username={'Andrii Volynets'}
      />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: 'var(--Messages-ButtonGap)',
        }}
      >
        <InputButton />
      </Box>

      <CommentList
        comments={[
          {
            id: '1',
            src: 'https://picsum.photos/200',
            username: 'User1',
            date: '2024-02-05',
            text: 'First comment',
            replies: [
              {
                id: '2',
                src: 'https://picsum.photos/200',
                username: 'User2',
                date: '2024-02-06',
                text: 'Reply to first comment',
                replies: [
                  {
                    id: '3',
                    src: 'https://picsum.photos/200',
                    username: 'User2',
                    date: '2024-02-06',
                    text: 'Reply to first comment',
                  },
                  {
                    id: '4',
                    src: 'https://picsum.photos/200',
                    username: 'User2',
                    date: '2024-02-06',
                    text: 'Reply to first comment',
                  },
                  {
                    id: '5',
                    src: 'https://picsum.photos/200',
                    username: 'User2',
                    date: '2024-02-06',
                    text: 'Reply to first comment',
                  },
                  {
                    id: '6',
                    src: 'https://picsum.photos/200',
                    username: 'User2',
                    date: '2024-02-06',
                    text: 'Reply to first comment',
                  },
                ],
              },
              {
                id: '7',
                src: 'https://picsum.photos/200',
                username: 'User2',
                date: '2024-02-06',
                text: 'Reply to first comment',
              },
              {
                id: '8',
                src: 'https://picsum.photos/200',
                username: 'User2',
                date: '2024-02-06',
                text: 'Reply to first comment',
              },
              {
                id: '9',
                src: 'https://picsum.photos/200',
                username: 'User2',
                date: '2024-02-06',
                text: 'Reply to first comment',
              },
            ],
          },
          {
            id: '10',
            src: 'https://picsum.photos/200',
            username: 'User3',
            date: '2024-02-07',
            text: 'Second comment',
          },
        ]}
      />
    </Box>
  );
};

export { SingleThread };
