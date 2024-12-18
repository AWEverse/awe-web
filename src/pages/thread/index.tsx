import MediaPost from '@/entities/MediaPost';
import { FC, ReactNode } from 'react';

interface OwnProps {}

interface StateProps {}

const Thread: FC<OwnProps & StateProps> = () => {
  return (
    <div className="flex items-center flex-col">
      <MediaPost />
    </div>
  );
};

export default Thread;
