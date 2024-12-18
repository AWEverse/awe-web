import FlatList from '@/entities/FlatList';
import ReactionElement from '@/shared/ui/ReactionElement';
import { People } from '@mui/icons-material';

const CommentFooter = () => {
  return (
    <FlatList
      horizontal
      data={[
        {
          icon: <People />,
          reactions: 2,
          avatar: 'https://picsum.photos/200',
          active: true,
        },
        {
          icon: <People />,
          reactions: 1,
          avatar: 'https://picsum.photos/200',
        },
        {
          icon: <People />,
          reactions: 4,
          avatar: 'https://picsum.photos/200',
        },
        {
          icon: <People />,
          reactions: 10,
          avatar: 'https://picsum.photos/200',
        },
        {
          icon: <People />,
          reactions: 3,
          avatar: 'https://picsum.photos/200',
        },
      ]}
      keyExtractor={() => Math.random().toString()}
      renderItem={item => <ReactionElement {...item} />}
    />
  );
};

export default CommentFooter;
