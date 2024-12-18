import buildClassName from '@/shared/lib/buildClassName';
import { forwardRef } from 'react';

interface OwnProps {
  className?: string;
}

interface StateProps {}

const ArchivedScreen = forwardRef<HTMLDivElement, OwnProps & StateProps>((props, ref) => {
  const { className } = props;
  return (
    <div ref={ref} className={buildClassName(className)}>
      Archive
    </div>
  );
});

export default ArchivedScreen;
