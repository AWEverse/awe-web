import CommentList from '@/widgets/coments/ui/CommentList';
import {
  Badge,
  Stack,
  Avatar,
  Typography,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  ButtonGroup,
  Link,
} from '@mui/material';
import Readme from '../../ui/Readme';
import ReactionElement from '@/shared/ui/ReactionElement';
import FlatList from '@/entities/FlatList';

const PublicationInfo = () => (
  <Typography level="body-sm" sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
    <Avatar src="https://picsum.photos/200" sx={{ width: 16, height: 16 }} />
    <Link level="body-sm">r/UkraineHub</Link>
    posted by <Link> Albinchik</Link> • 1 hour ago
  </Typography>
);

// Компонент для отображения комментариев
const CommentsAccordion = () => {
  return (
    <Accordion
      defaultExpanded
      sx={{
        gap: 0.25,
        p: 0,
        borderBottom: 'none',
      }}
    >
      <AccordionSummary sx={{ px: 2 }}>
        <Badge
          badgeContent={12}
          badgeInset="10%"
          color="primary"
          size="sm"
          sx={{
            '.MuiBadge-badge': {
              top: '0.4rem',
              right: '-0.95rem',
            },
          }}
        >
          <Typography>Comments</Typography>
        </Badge>
      </AccordionSummary>
      <AccordionDetails>
        <Divider />
        <Typography
          endDecorator={
            <ButtonGroup size="sm">
              <Button>Oldest</Button>
              <Button>Newest</Button>
              <Button>Relevance</Button>
            </ButtonGroup>
          }
          level="title-lg"
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            alignItems: 'center',
            mt: 1,
            mb: 2,
          }}
        >
          64 comments · 90 replies
        </Typography>

        <CommentList
          comments={[
            {
              id: '1',
              src: 'https://picsum.photos/200',
              username: 'NatureLover',
              date: '2024-05-21',
              text: 'Люблю гулять в лесу, особенно весной, когда все расцветает.',
              replies: [
                {
                  id: '2',
                  src: 'https://picsum.photos/200',
                  username: 'EcoWarrior',
                  date: '2024-05-21',
                  text: 'Согласен! Весна приносит столько жизни и красок в природу.',
                  replies: [
                    {
                      id: '3',
                      src: 'https://picsum.photos/200',
                      username: 'BirdWatcher',
                      date: '2024-05-21',
                      text: 'А еще это лучшее время для наблюдения за птицами.',
                      replies: [
                        {
                          id: '31',
                          src: 'https://picsum.photos/200',
                          username: 'EcoWarrior',
                          date: '2024-05-21',
                          text: 'Согласен! Весна приносит столько жизни и красок в природу.',
                          replies: [
                            {
                              id: '332',
                              src: 'https://picsum.photos/200',
                              username: 'BirdWatcher',
                              date: '2024-05-21',
                              text: 'А еще это лучшее время для наблюдения за птицами.',
                              replies: [
                                {
                                  id: '31',
                                  src: 'https://picsum.photos/200',
                                  username: 'EcoWarrior',
                                  date: '2024-05-21',
                                  text: 'Согласен! Весна приносит столько жизни и красок в природу.',
                                  replies: [],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      id: '4',
                      src: 'https://picsum.photos/200',
                      username: 'PlantLover',
                      date: '2024-05-21',
                      text: 'Не могу дождаться, когда зацветут все мои любимые цветы.',
                    },
                  ],
                  dialogs: [],
                },
                {
                  id: '5',
                  src: 'https://picsum.photos/200',
                  username: 'MountainClimber',
                  date: '2024-05-21',
                  text: 'А я обожаю весной подниматься в горы. Пейзажи просто невероятные!',
                },
              ],
            },
            {
              id: '6',
              src: 'https://picsum.photos/200',
              username: 'RiverRider',
              date: '2024-05-21',
              text: 'Реки весной особенно полноводны, отличное время для каякинга!',
              replies: [
                {
                  id: '7',
                  src: 'https://picsum.photos/200',
                  username: 'NatureLover',
                  date: '2024-05-21',
                  text: 'Тоже люблю каякинг! А еще весной можно увидеть много диких животных у воды.',
                },
                {
                  id: '8',
                  src: 'https://picsum.photos/200',
                  username: 'EcoWarrior',
                  date: '2024-05-21',
                  text: 'Главное помнить, что надо оставлять природу чистой после себя.',
                },
                {
                  id: '9',
                  src: 'https://picsum.photos/200',
                  username: 'Hiker',
                  date: '2024-05-21',
                  text: 'Полностью согласен. Каждый из нас должен заботиться о природе.',
                },
              ],
            },
            {
              id: '10',
              src: 'https://picsum.photos/200',
              username: 'ForestGuardian',
              date: '2024-05-21',
              text: 'Сейчас особенно важно защищать наши леса от вырубки.',
              replies: [
                {
                  id: '11',
                  src: 'https://picsum.photos/200',
                  username: 'TreeHugger',
                  date: '2024-05-21',
                  text: 'Да, каждый раз, когда вырубают дерево, теряется целая экосистема.',
                },
                {
                  id: '12',
                  src: 'https://picsum.photos/200',
                  username: 'BirdWatcher',
                  date: '2024-05-21',
                  text: 'Это также влияет на птиц, ведь они теряют свои гнездовья.',
                },
                {
                  id: '13',
                  src: 'https://picsum.photos/200',
                  username: 'NatureLover',
                  date: '2024-05-21',
                  text: 'Согласен. Мы должны искать устойчивые способы использования ресурсов.',
                },
              ],
            },
            {
              id: '14',
              src: 'https://picsum.photos/200',
              username: 'SeaSavior',
              date: '2024-05-21',
              text: 'А кто что думает про охрану океанов? Они тоже нуждаются в нашей защите.',
              replies: [
                {
                  id: '15',
                  src: 'https://picsum.photos/200',
                  username: 'Diver',
                  date: '2024-05-21',
                  text: 'Абсолютно! Подводный мир настолько удивителен, но так уязвим.',
                },
                {
                  id: '16',
                  src: 'https://picsum.photos/200',
                  username: 'MarineBiologist',
                  date: '2024-05-21',
                  text: 'Согласна, особенно коралловые рифы, которые являются домом для многих видов.',
                },
                {
                  id: '17',
                  src: 'https://picsum.photos/200',
                  username: 'Fisherman',
                  date: '2024-05-21',
                  text: 'Нужно больше регулировать рыболовство, чтобы сохранить популяции рыб.',
                },
              ],
            },
            {
              id: '18',
              src: 'https://picsum.photos/200',
              username: 'StarGazer',
              date: '2024-05-21',
              text: 'Не забывайте и про световое загрязнение. Небо в ночное время становится все менее звездным.',
              replies: [
                {
                  id: '19',
                  src: 'https://picsum.photos/200',
                  username: 'AstroPhotographer',
                  date: '2024-05-21',
                  text: 'Да, я обожаю фотографировать звезды, но сейчас это становится все сложнее.',
                },
                {
                  id: '20',
                  src: 'https://picsum.photos/200',
                  username: 'EcoWarrior',
                  date: '2024-05-21',
                  text: 'Световое загрязнение также влияет на ночных животных. Надо искать баланс.',
                },
              ],
            },
          ]}
        />
        <CommentList
          comments={[
            {
              id: '1',
              src: 'https://picsum.photos/200',
              username: 'NatureLover',
              date: '2024-05-21',
              text: 'Люблю гулять в лесу, особенно весной, когда все расцветает.',
              replies: [
                {
                  id: '2',
                  src: 'https://picsum.photos/200',
                  username: 'EcoWarrior',
                  date: '2024-05-21',
                  text: 'Согласен! Весна приносит столько жизни и красок в природу.',
                  replies: [
                    {
                      id: '3',
                      src: 'https://picsum.photos/200',
                      username: 'BirdWatcher',
                      date: '2024-05-21',
                      text: 'А еще это лучшее время для наблюдения за птицами.',
                      replies: [
                        {
                          id: '31',
                          src: 'https://picsum.photos/200',
                          username: 'EcoWarrior',
                          date: '2024-05-21',
                          text: 'Согласен! Весна приносит столько жизни и красок в природу.',
                          replies: [
                            {
                              id: '332',
                              src: 'https://picsum.photos/200',
                              username: 'BirdWatcher',
                              date: '2024-05-21',
                              text: 'А еще это лучшее время для наблюдения за птицами.',
                              replies: [
                                {
                                  id: '31',
                                  src: 'https://picsum.photos/200',
                                  username: 'EcoWarrior',
                                  date: '2024-05-21',
                                  text: 'Согласен! Весна приносит столько жизни и красок в природу.',
                                  replies: [],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      id: '4',
                      src: 'https://picsum.photos/200',
                      username: 'PlantLover',
                      date: '2024-05-21',
                      text: 'Не могу дождаться, когда зацветут все мои любимые цветы.',
                    },
                  ],
                  dialogs: [],
                },
                {
                  id: '5',
                  src: 'https://picsum.photos/200',
                  username: 'MountainClimber',
                  date: '2024-05-21',
                  text: 'А я обожаю весной подниматься в горы. Пейзажи просто невероятные!',
                },
              ],
            },
            {
              id: '6',
              src: 'https://picsum.photos/200',
              username: 'RiverRider',
              date: '2024-05-21',
              text: 'Реки весной особенно полноводны, отличное время для каякинга!',
              replies: [
                {
                  id: '7',
                  src: 'https://picsum.photos/200',
                  username: 'NatureLover',
                  date: '2024-05-21',
                  text: 'Тоже люблю каякинг! А еще весной можно увидеть много диких животных у воды.',
                },
                {
                  id: '8',
                  src: 'https://picsum.photos/200',
                  username: 'EcoWarrior',
                  date: '2024-05-21',
                  text: 'Главное помнить, что надо оставлять природу чистой после себя.',
                },
                {
                  id: '9',
                  src: 'https://picsum.photos/200',
                  username: 'Hiker',
                  date: '2024-05-21',
                  text: 'Полностью согласен. Каждый из нас должен заботиться о природе.',
                },
              ],
            },
            {
              id: '10',
              src: 'https://picsum.photos/200',
              username: 'ForestGuardian',
              date: '2024-05-21',
              text: 'Сейчас особенно важно защищать наши леса от вырубки.',
              replies: [
                {
                  id: '11',
                  src: 'https://picsum.photos/200',
                  username: 'TreeHugger',
                  date: '2024-05-21',
                  text: 'Да, каждый раз, когда вырубают дерево, теряется целая экосистема.',
                },
                {
                  id: '12',
                  src: 'https://picsum.photos/200',
                  username: 'BirdWatcher',
                  date: '2024-05-21',
                  text: 'Это также влияет на птиц, ведь они теряют свои гнездовья.',
                },
                {
                  id: '13',
                  src: 'https://picsum.photos/200',
                  username: 'NatureLover',
                  date: '2024-05-21',
                  text: 'Согласен. Мы должны искать устойчивые способы использования ресурсов.',
                },
              ],
            },
            {
              id: '14',
              src: 'https://picsum.photos/200',
              username: 'SeaSavior',
              date: '2024-05-21',
              text: 'А кто что думает про охрану океанов? Они тоже нуждаются в нашей защите.',
              replies: [
                {
                  id: '15',
                  src: 'https://picsum.photos/200',
                  username: 'Diver',
                  date: '2024-05-21',
                  text: 'Абсолютно! Подводный мир настолько удивителен, но так уязвим.',
                },
                {
                  id: '16',
                  src: 'https://picsum.photos/200',
                  username: 'MarineBiologist',
                  date: '2024-05-21',
                  text: 'Согласна, особенно коралловые рифы, которые являются домом для многих видов.',
                },
                {
                  id: '17',
                  src: 'https://picsum.photos/200',
                  username: 'Fisherman',
                  date: '2024-05-21',
                  text: 'Нужно больше регулировать рыболовство, чтобы сохранить популяции рыб.',
                },
              ],
            },
            {
              id: '18',
              src: 'https://picsum.photos/200',
              username: 'StarGazer',
              date: '2024-05-21',
              text: 'Не забывайте и про световое загрязнение. Небо в ночное время становится все менее звездным.',
              replies: [
                {
                  id: '19',
                  src: 'https://picsum.photos/200',
                  username: 'AstroPhotographer',
                  date: '2024-05-21',
                  text: 'Да, я обожаю фотографировать звезды, но сейчас это становится все сложнее.',
                },
                {
                  id: '20',
                  src: 'https://picsum.photos/200',
                  username: 'EcoWarrior',
                  date: '2024-05-21',
                  text: 'Световое загрязнение также влияет на ночных животных. Надо искать баланс.',
                },
              ],
            },
          ]}
        />
      </AccordionDetails>
    </Accordion>
  );
};

// Основной компонент RightColumn
const RightColumn = () => {
  return (
    <Stack
      sx={{
        position: 'relative',
        borderRadius: 'md',
        px: 1,
        gap: 1,
        backgroundColor: 'background.surface',
      }}
    >
      <Typography component="h1" level="h3">
        Post your favorite (or your own) resources/channels/what have you.
      </Typography>

      <PublicationInfo />

      {/* <Typography level="body-md">
        Due to a bunch of people posting their channels/websites/etc recently,
        people have grown restless. Lorem ipsum, dolor sit amet consectetur
        adipisicing elit. Doloremque ratione voluptas temporibus maxime quasi
        nihil odit quam aliquid expedita repellat magni cupiditate illo
        repellendus, vero obcaecati sint. Quae, officia excepturi?
      </Typography> */}

      <Readme />

      <FlatList
        horizontal
        data={[
          {
            icon: <>♥</>,
            reactions: 1,
            avatar: 'https://picsum.photos/200',
          },
          {
            icon: <>♥</>,
            reactions: 1,
            avatar: 'https://picsum.photos/200',
          },
        ]}
        keyExtractor={(_, index) => `key-${index}`}
        renderItem={item => <ReactionElement avatar={item.avatar} icon={item.icon} reactions={item.reactions} />}
      />

      {/* Компонент CommentsAccordion */}
      <AccordionGroup
        sx={{
          borderRadius: 'md',
        }}
        transition="0.2s"
        variant="plain"
      >
        <CommentsAccordion />
      </AccordionGroup>
    </Stack>
  );
};

export default RightColumn;
