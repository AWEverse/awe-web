import React from 'react';
import CommentAvatar from './CommentAvatar';
import CommentFooter from './CommentFooter';
import ItemLayout from './ItemLayout';
import { Box, Typography, Stack, Breadcrumbs, Link } from '@mui/material';

interface MetaProps {
  likes: number;
  dislikes: number;
  comments: number;
}

export interface CommentItemProps {
  id: string;
  src: string;
  username: string;
  date: string;
  text: React.ReactNode;
  meta?: MetaProps;
  replie?: CommentItemProps;
  replies?: CommentItemProps[];
  dialogs?: Omit<CommentItemProps, 'replies'>[];
}

const CommentItem: React.FC<CommentItemProps> = props => {
  const { src, username, date, text, replies } = props;
  const [showComments, setShowComments] = React.useState(true);

  const handleClick = () => {
    setShowComments(!showComments);
  };

  return (
    <ItemLayout.Root
      startDecorator={<CommentAvatar src={src} onClick={handleClick} />}
      sx={{
        gap: 0.5,
        '&:first-of-type .CommentAvatar-tail': {
          display: 'none',
        },
      }}
    >
      <Box
        aria-labelledby="comment-title"
        role="group"
        sx={{
          display: 'flex',
          mt: { xs: 0.5, sm: 0 },
          gap: { xs: 0, sm: 1 },
          alignItems: 'flex-start',
          flexDirection: { xs: 'column', sm: 'row' },
        }}
      >
        <Typography level="title-md" sx={{ flexWrap: 'nowrap', textWrap: 'nowrap' }}>
          {username}
        </Typography>
        <Breadcrumbs aria-label="breadcrumbs" size="sm" sx={{ p: 0 }}>
          {['Commented on post', 'Created new thread', 'Liked a post'].map((item: string) => (
            <Link key={item} color="neutral" href="#basics">
              {item}
            </Link>
          ))}
        </Breadcrumbs>
      </Box>
      {showComments && (
        <>
          <Box
            sx={{
              display: 'flex',
              gap: 0.5,
              alignItems: 'flex-end',
              flexWrap: 'wrap',
            }}
          >
            <Typography level="body-md" sx={{ display: 'inline' }}>
              {text}
            </Typography>
            <Typography
              level="body-xs"
              sx={{
                display: 'inline',
                alignSelf: 'flex-end',
                mb: -0.25,
              }}
            >
              {date}
            </Typography>
          </Box>

          <Stack sx={{ gap: 1, mt: 1 }}>
            <CommentFooter />
            {replies && replies.length > 0 && (
              <Stack sx={{ ml: '-0.75rem', gap: 1 }}>
                {replies.map(reply => (
                  <CommentItem key={reply.id} {...reply} replie={props} />
                ))}
              </Stack>
            )}
          </Stack>
        </>
      )}
    </ItemLayout.Root>
  );
};

export default CommentItem;
