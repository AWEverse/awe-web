import React from 'react';
import CommentItem, { CommentItemProps } from './CommentItem';
import { Divider, Stack, Link } from '@mui/material';

interface CommentListProps {
  comments: CommentItemProps[];
}

const CommentList: React.FC<CommentListProps> = ({ comments }) => {
  return (
    <Stack gap={0.5}>
      {comments.map((comment, index) => (
        <React.Fragment key={comment.id + index}>
          <Divider
            sx={{
              '--Divider-childPosition': { xs: '50%', sm: '99%' },
              borderColor: 'divider',
              borderWidth: 1,

              '&:not(:first-of-type)': { mt: 1 },
            }}
          >
            Section started by&nbsp;
            <Link href={`/users/${comment.username}`} level="body-sm">
              @{comment.username}
            </Link>
            ,&nbsp;<time>{comment.date}</time>
          </Divider>

          <CommentItem {...comment} />
        </React.Fragment>
      ))}
    </Stack>
  );
};

export default CommentList;
