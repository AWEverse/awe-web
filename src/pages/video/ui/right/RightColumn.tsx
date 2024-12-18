import { FC } from 'react';
import VideoTopic from './VideoTopic';
import buildClassName from '@/shared/lib/buildClassName';

interface OwnProps {
  className?: string;
}

const RightColumn: FC<OwnProps> = props => {
  const { className } = props;

  return (
    <section className={buildClassName('flex flex-col gap-1', className)}>
      {Array.from({ length: 10 }).map((_, i) => (
        <VideoTopic
          key={i}
          author="user"
          description="63K views • 2 months ago"
          id={i}
          size="medium"
          thumbnail="https://image.api.playstation.com/vulcan/ap/rnd/202109/1518/PQbJo2xmwHkkhaHmpBH0sD5q.png"
          title="Crysis 4 is coming: Crysis 4 is coming"
        />
      ))}
    </section>
  );
};

export default RightColumn;
