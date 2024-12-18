import { CommentProps } from '@/widgets/coments/types';

export const comments: CommentProps[] = [
  {
    avatarSrc: 'https://i.pravatar.cc/48?img=1',
    userName: 'Mary Jane',
    action: 'created a Fnew thread',
    timeAgo: '3 hours ago',
    content:
      'We just released windUI v1.5, which includes a brand new component. An activity feed is a chronological record of system events or user actions. Have a look at the feed page and let me know what you think. Feedback is highly appreciated.',

    replies: [
      {
        avatarSrc: 'https://i.pravatar.cc/48?img=1',
        userName: 'Mary Jane',
        action: 'created a new thread',
        timeAgo: '3 hours ago',
        content:
          'We just released windUI v1.5, which includes a brand new component. An activity feed is a chronological record of system events or user actions. Have a look at the feed page and let me know what you think. Feedback is highly appreciated.',
      },
      {
        avatarSrc: 'https://i.pravatar.cc/48?img=2',
        userName: 'John Doe',
        action: 'commented on a post',
        timeAgo: '5 hours ago',
        content:
          'The new component looks great! I particularly like the sleek design. Looking forward to exploring more features in future releases.',
      },
    ],
  },
];
