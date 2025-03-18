import ThreadCard from "@/entities/thread-card";
import { Box, Typography } from "@mui/material";
import ThreadTags from "./ThreadTags";
import FlatList from "@/entities/FlatList";

const MainPage = () => {
  return (
    <Box
      sx={{
        pt: 1,
        pb: 2,
        width: "100dvw",
        px: { xs: 1, sm: 8, md: 16, lg: 24 },
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      <ThreadTags
        items={[
          "For you",
          "Subscriptions",
          "You marked as important",
          "Liked by you",
          "Replies",
          "Saved",
        ]}
      />

      <Typography level="h2">Branches for you</Typography>

      <section role="feed" aria-label="User Threads Feed" aria-busy={false}>
        {data.map((thread, index) => (
          <ThreadCard
            {...thread}
            positionInFeed={index}
            totalFeedSize={data.length}
            isBusy={false}
          />
        ))}
      </section>
    </Box>
  );
};

export { MainPage };

const data = [
  {
    userAvatarSrc: "https://mui.com/static/images/avatar/1.jpg",
    userName: "Elena Petrova",
    userTitle: "The Lost Diary Mystery",
    userSubtitle:
      "Только что нашла старый дневник в подвале! Страницы пожелтели, но записи всё ещё читаемы. Кто-то писал о тайном сокровище в горах. Стоит ли отправиться на поиски?",
    metaText:
      "3 часа назад • Reply by [Elena Petrova](https://twitter.com/elena_petrova) and [2 others](https://twitter.com/explorers) in [5 comments](https://twitter.com/elena_petrova)",
    actionDecorator: (
      <div>
        <button>❤️ 12</button> <button>💬 5</button>
      </div>
    ),
  },
  {
    userAvatarSrc: "https://mui.com/static/images/avatar/2.jpg",
    userName: "Andrii Volynets",
    userTitle: "The Enigmatic Package",
    userSubtitle:
      "Потрепанная посылка прибыла сегодня утром. Внутри — карта с выцветшими линиями и странный ключ. Кто-нибудь знает, что это может открыть?",
    metaText:
      "1 час назад • Reply by [Andrii Volynets](https://twitter.com/andrii_volynets) in [3 comments](https://twitter.com/andrii_volynets)",
    actionDecorator: (
      <div>
        <button>❤️ 8</button> <button>💬 3</button>
      </div>
    ),
  },
  {
    userAvatarSrc: "https://mui.com/static/images/avatar/3.jpg",
    userName: "Sofia Martinez",
    userTitle: "Shadows After Midnight",
    userSubtitle:
      'Сосед оставил записку под дверью: "Остерегайтесь теней после полуночи". Это шутка или что-то серьёзное? Кто-нибудь сталкивался с подобным?',
    metaText:
      "15 минут назад • Reply by [Sofia Martinez](https://twitter.com/sofia_martinez) and [4 others](https://twitter.com/mysteryfans) in [7 comments](https://twitter.com/sofia_martinez)",
    actionDecorator: (
      <div>
        <button>❤️ 25</button> <button>💬 7</button>
      </div>
    ),
  },
  {
    userAvatarSrc: "https://mui.com/static/images/avatar/4.jpg",
    userName: "Liam Chen",
    userTitle: "Voices from the Past",
    userSubtitle:
      "На чердаке нашёл коробку с радиоприёмником 60-х. Он внезапно включился и начал передавать голоса... на неизвестном языке. Есть идеи, что делать?",
    metaText:
      "5 часов назад • Reply by [Liam Chen](https://twitter.com/liam_chen) and [1 other](https://twitter.com/radioenthusiast) in [2 comments](https://twitter.com/liam_chen)",
    actionDecorator: (
      <div>
        <button>❤️ 15</button> <button>💬 2</button>
      </div>
    ),
  },
];
